# OPERATOR mesh refactor — 2→N peers

## What this changes (and what it doesn't)

Your signaling is already a room (the Worker's `/poll` returns every message where
`from !== peer.id` — it broadcasts, it doesn't pair-route). Your edit protocol
(`F`/`K`/`X`/`C`/`P`/`Z`) is already **node**-addressed, so a delta means the same
thing no matter who sent it. That means the merge layer is already mesh-safe.

The two-ness lives in exactly three places:

1. **Worker** — hard cap `meta.peers.length >= 2`, binary `host`/`guest` role,
   and signals have no `to` field so an offer can't be aimed at one specific peer.
2. **Client transport** — one global `pc`, one global `link`.
3. **Client presence** — one remote identity (`theirNode`, `themInk`, `themMsgs`,
   `tag-them`, `effectiveRemoteRole`). Cursors/chat assume a single "them."

We fix all three. Topology = **full mesh with perfect negotiation**: every peer
holds one RTCPeerConnection per *other* peer, and the lexically-lower peerId is the
"polite/offerer" side so both ends never offer at once.

Mesh is right for 2–5 collaborative authors. Past ~5, switch to star or Cloudflare
SFU (separate effort — out of scope here).

---

## PART A — Worker (worker.js)

### A1. Allow N peers, drop the binary role

The OPERATOR `/join` handler currently hard-caps at 2 and assigns host/guest by
position. Replace the cap and the role assignment.

**Find** (around line 519):
```js
      if (meta.peers.length >= 2) return json(request, this.env, { error: 'room-full' }, 409);
      const peer = {
        id: newPeerId(),
        role: meta.peers.length === 0 ? 'host' : 'guest',
        clientId: clientId || undefined,
        last: now,
      };
```
**Replace with:**
```js
      if (meta.peers.length >= MAX_OPERATOR_PEERS) return json(request, this.env, { error: 'room-full' }, 409);
      const peer = {
        id: newPeerId(),
        // First peer is host (canonical-film authority); everyone else is a member.
        role: meta.peers.length === 0 ? 'host' : 'member',
        clientId: clientId || undefined,
        last: now,
      };
```

**Add a constant** near the top (by `MAX_THUNDER_PEERS`):
```js
const MAX_OPERATOR_PEERS = 6;   // mesh stays healthy to ~5–6; raise only with care
```

> Note: `intent === 'guest'` in the existing role-conflict check still works — guests
> just map to role `member`. If you want to be tidy, treat any non-`host` intent as
> `member`. The `host-not-ready` guard (guest joining empty room) can stay; it still
> protects the canonical-film ownership.

### A2. Roster instead of a count — every response must list peers

The client needs to know *who* is in the room to open a connection per peer. Today
the Worker returns `peers: meta.peers.length` (just a number). Change every OPERATOR
response to return an id roster.

Add a helper near `findPeer`:
```js
function peerRoster(meta) {
  return meta.peers.map((p) => ({ id: p.id, role: p.role }));
}
```

Then in the OPERATOR handlers, replace `peers: meta.peers.length` with
`peers: peerRoster(meta)` and `roster: peerRoster(meta)` in:
- the `/join` success response (both the existing-peer branch and the new-peer branch),
- the `/poll` response.

Keeping `peers` as the array is fine — but your **client's `peerCountOf()` currently
reads `.length` off whatever `peers` is.** Since you're changing the shape, update
`peerCountOf` (Part B0) to handle an array. Alternatively send BOTH
`peers: meta.peers.length` (count, unchanged) and `roster: peerRoster(meta)` (new) so
nothing else breaks. The diffs below assume the **dual-field** approach — least churn:

```js
// in /join (new peer) and /poll responses, alongside existing fields:
        peers: meta.peers.length,        // unchanged: count
        roster: peerRoster(meta),        // NEW: [{id, role}, ...]
```

### A3. Aim signals: honor a `to` field

Right now `/send` stores the message and `/poll` fans it out to everyone. For mesh you
must be able to send an offer to ONE peer. Add an optional `to` on the stored message
and filter on it at poll time.

**In `/send`** (around line 552), where the message is pushed:
```js
      messages.push({ seq: meta.seq, from: peer.id, msg: body.msg, time: now, epoch: meta.epoch });
```
**Replace with:**
```js
      messages.push({
        seq: meta.seq, from: peer.id,
        to: (typeof body.to === 'string' && body.to) ? body.to : null,  // null = broadcast
        msg: body.msg, time: now, epoch: meta.epoch,
      });
```

**In `/poll`** (around line 568), the filter:
```js
        messages: messages.filter((entry) => entry.epoch === meta.epoch && entry.seq > after && entry.from !== peer.id),
```
**Replace with:**
```js
        messages: messages.filter((entry) =>
          entry.epoch === meta.epoch &&
          entry.seq > after &&
          entry.from !== peer.id &&
          (entry.to === null || entry.to === undefined || entry.to === peer.id)
        ),
```

### A4. Raise the message buffer

With N peers exchanging offer/answer/ICE simultaneously, `MAX_MSGS = 64` is tight
(ICE alone can be dozens of candidates × N peers). Bump it:
```js
const MAX_MSGS = 256;
```

### A5. Reconcile: re-elect host on dropout (already mostly fine)

`reconcilePeers` already promotes `meta.peers[0]` to host if no host remains. With
roles now `host`/`member`, that logic is unchanged and correct — when the host leaves,
the oldest remaining member becomes host and `epoch` bumps (forcing clients to rebuild).
Just confirm the host-only `/film` POST still gates on `peer.role !== 'host'` — it does.

> **MESSAGE_TYPES** (`offer`/`answer`/`ice`/`restart`) needs no change — they're still
> the only signal types; we just route them per-peer now.

---

## PART B — Client (operator-studio.html)

This is the bigger surgery. The principle: replace the single `pc`/`link` with a
`Map` keyed by remote peerId, and give the negotiation a deterministic offerer.

### B0. Fix peerCountOf for the roster

**Find:**
```js
function peerCountOf(...)   // wherever it's defined
```
Make it tolerant of both shapes:
```js
function peerCountOf(p){
  if (typeof p === 'number') return p;
  if (Array.isArray(p)) return p.length;
  return 0;
}
```
(If you adopted the dual-field A2, the client keeps reading `j.peers` as the count and
reads `j.roster` for ids — see B3.)

### B1. The connection registry

Replace the single-peer globals. **Find:**
```js
var link=null,forceKeyframe=false;
```
Keep `forceKeyframe`, but introduce a registry. Add right after:
```js
// ===== MESH: one connection per remote peer =====
// conns[remoteId] = { pc, link, makingOffer:false, polite:bool, node:null, ink:[], msgs:[] }
var conns = Object.create(null);
function connList(){ return Object.keys(conns).map(function(id){ return conns[id]; }); }
function isPolite(remoteId){ return String(room.peerId) > String(remoteId); }  // lower id = impolite offerer
function anyOpen(){ return connList().some(function(c){ return c.link && c.link.kind==='webrtc'; }); }
```

Keep `link=null` as a **compat shim** so the ~30 existing `if(link&&link.kind...)`
checks don't all have to change at once. We'll repoint `link` at "any open conn" for
read-only checks, and change the *send* path to fan out (B5).

### B2. Per-peer RTCPeerConnection factory

Your `newPeer(asHost, ice)` mutates the single global `pc`/`isHostPeer`. Replace its
*role* in the room path with a per-peer builder. Add:
```js
function makePeerConn(remoteId, ice){
  var servers = ice || getIceServers();
  var pc = new RTCPeerConnection({ iceServers: servers });
  var polite = isPolite(remoteId);
  var entry = { pc: pc, link: null, makingOffer:false, polite:polite, node:null, ink:[], msgs:[] };
  conns[remoteId] = entry;

  // Data channels: the IMPOLITE peer (lower id) creates them; the other side receives.
  entry.link = makeWebRTC(pc, function(buf){ receiveFrame(buf); }, !polite);

  pc.onicecandidate = function(e){
    if (e.candidate) roomSend({ type:'ice', candidate:e.candidate }, remoteId).catch(function(){});
  };
  // Perfect negotiation: offer when our own state needs it.
  pc.onnegotiationneeded = function(){
    if (polite) return;                 // only the impolite side initiates
    entry.makingOffer = true;
    pc.createOffer()
      .then(function(o){ return pc.setLocalDescription(o); })
      .then(function(){ return roomSend({ type:'offer', sdp:pc.localDescription }, remoteId); })
      .catch(function(err){ log('MESH','offer err '+err.message); })
      .then(function(){ entry.makingOffer = false; });
  };
  pc.onconnectionstatechange = function(){
    if (pc.connectionState==='failed' || pc.connectionState==='closed') dropConn(remoteId);
    refreshLinkShim();
  };
  refreshLinkShim();
  return entry;
}

function dropConn(remoteId){
  var c = conns[remoteId]; if(!c) return;
  try{ c.pc.close(); }catch(e){}
  delete conns[remoteId];
  // If this peer owned a remote cursor, clear it.
  if (theirNode && c.node === theirNode){ theirNode=null; }
  refreshLinkShim();
  renderStrip(); renderBranches(); refreshPresence();
}

// Point the legacy `link`/`pc` shims at any live conn so old read-only checks pass.
function refreshLinkShim(){
  var open = connList().filter(function(c){ return c.link && c.link.kind==='webrtc'; });
  link = open.length ? open[0].link : (link && link.kind==='loopback' ? link : makeLoopback(function(){}));
  pc   = open.length ? open[0].pc : pc;
}
```

> **Why "impolite creates the channels":** data channels trigger
> `onnegotiationneeded`. If both sides created them you'd get glare. One creator +
> perfect-negotiation rollback (B4) = clean every time.

### B3. Reconcile the roster every poll — open/close conns to match

This is the heart of mesh. After each poll, compare the room roster to `conns` and
open connections to new peers, drop connections to departed peers.

In `pollRoom`'s `.then(function(j){ ... })` (the OPERATOR one, ~line 978), after you
read `peers`/`epoch`, add a roster reconcile. Replace the epoch/role block:
```js
      var peers=peerCountOf(j.peers),changed=room.epoch&&j.epoch!==room.epoch,roleChanged=j.role&&j.role!==room.role;
      if(changed||roleChanged){room.epoch=j.epoch;room.role=j.role;room.after=0;initializeRoomPeer();}
```
**With:**
```js
      var peers=peerCountOf(j.peers);
      var epochChanged = room.epoch && j.epoch!==room.epoch;
      if (epochChanged){ room.epoch=j.epoch; room.role=j.role; room.after=0; rebuildAllConns(); }
      if (j.role) room.role = j.role;            // host/member can change on dropout
      reconcileRoster(j.roster || []);            // open/close per-peer conns
```

Add the two functions:
```js
function reconcileRoster(roster){
  var present = Object.create(null);
  roster.forEach(function(p){
    if (!p || !p.id || p.id===room.peerId) return;  // skip self
    present[p.id] = true;
    if (!conns[p.id]) makePeerConn(p.id, room.ice);  // NEW peer → open a conn
  });
  // Departed peers → close.
  Object.keys(conns).forEach(function(id){ if(!present[id]) dropConn(id); });
  refreshPresence();
}
function rebuildAllConns(){
  Object.keys(conns).forEach(function(id){ try{ conns[id].pc.close(); }catch(e){} });
  conns = Object.create(null);
  // roster reconcile on the next poll re-opens everything under the new epoch
}
```

> If you used **A2 dual-field**, `j.peers` stays the count and `j.roster` is the id
> list — exactly what the code above assumes. Good.

### B4. Per-peer signal handling with perfect negotiation

`handleSignal(msg)` currently drives the single `pc`. It must now (a) find the conn by
`msg.from`, and (b) implement glare handling. The Worker already includes `from` on
every polled entry; make sure `pollRoom` passes the whole entry, not just `entry.msg`.

**Find** in `pollRoom`:
```js
(j.messages||[]).forEach(function(entry){chain=chain.then(function(){return handleSignal(entry.msg);});});
```
**Replace with:**
```js
(j.messages||[]).forEach(function(entry){chain=chain.then(function(){return handleSignal(entry);});});
```

**Replace `handleSignal` entirely:**
```js
function handleSignal(entry){
  if (!entry || !entry.msg || !entry.from) return Promise.resolve();
  var from = entry.from, msg = entry.msg;
  var c = conns[from];
  if (!c){ c = makePeerConn(from, room.ice); }   // peer we hadn't opened yet
  var pcx = c.pc;

  if (msg.type==='restart'){
    if (!c.polite){ // impolite side re-offers
      return pcx.createOffer({iceRestart:true})
        .then(function(o){return pcx.setLocalDescription(o);})
        .then(function(){return roomSend({type:'offer',sdp:pcx.localDescription}, from);})
        .catch(function(e){log('MESH','restart err '+e.message);});
    }
    return Promise.resolve();
  }

  if (msg.type==='offer'){
    // Glare: if we're mid-offer or not stable AND we're impolite, ignore their offer.
    var offerCollision = c.makingOffer || pcx.signalingState !== 'stable';
    if (offerCollision && !c.polite){ log('MESH','ignored colliding offer from '+from.slice(-6)); return Promise.resolve(); }
    var p = Promise.resolve();
    if (offerCollision){ // polite side rolls back, then accepts
      p = Promise.all([
        pcx.setLocalDescription({type:'rollback'}).catch(function(){}),
        pcx.setRemoteDescription(msg.sdp)
      ]);
    } else {
      p = pcx.setRemoteDescription(msg.sdp);
    }
    return p
      .then(function(){ return drainPending(c); })
      .then(function(){ return pcx.createAnswer(); })
      .then(function(a){ return pcx.setLocalDescription(a); })
      .then(function(){ return roomSend({type:'answer',sdp:pcx.localDescription}, from); })
      .catch(function(e){ log('MESH','offer handle err '+e.message); });
  }

  if (msg.type==='answer'){
    return pcx.setRemoteDescription(msg.sdp)
      .then(function(){ return drainPending(c); })
      .catch(function(e){ log('MESH','answer err '+e.message); });
  }

  if (msg.type==='ice'){
    if (!pcx.remoteDescription || !pcx.remoteDescription.type){
      (c.pending = c.pending || []).push(msg.candidate);
      return Promise.resolve();
    }
    return pcx.addIceCandidate(msg.candidate).catch(function(){});
  }
  return Promise.resolve();
}
function drainPending(c){
  var q = c.pending || []; c.pending = [];
  return q.reduce(function(pr,cand){ return pr.then(function(){ return c.pc.addIceCandidate(cand).catch(function(){}); }); }, Promise.resolve());
}
```

### B5. Fan-out send — the one change that makes edits propagate

Every edit currently calls `sendCtl(...)` → `link.sendControl(...)`, and frame data
goes `link.sendVisual(...)`. Both must now hit **every** conn. Two surgical edits:

**`sendCtl`** — find:
```js
    if(link && link.kind==='webrtc' && typeof link.sendControl==='function'){ link.sendControl(m); }
```
**Replace with:**
```js
    var sent=false;
    connList().forEach(function(c){ if(c.link && c.link.kind==='webrtc'){ if(c.link.sendControl(m)) sent=true; } });
    return sent;
```

**Visual frames** — find (in the frame send path, ~line 721):
```js
  if(link){ if(link.kind==='loopback') link.sendVisual(packed.buffer.slice(0)); else link.sendVisual(packed.buffer); }
```
**Replace with:**
```js
  var open = connList().filter(function(c){ return c.link && c.link.kind==='webrtc'; });
  if (open.length){
    open.forEach(function(c){ c.link.sendVisual(packed.buffer); });
  } else if (link && link.kind==='loopback'){
    link.sendVisual(packed.buffer.slice(0));
  }
```

> ArrayBuffers are neutered on transfer by some stacks; sending the same `packed.buffer`
> to multiple channels is fine for `RTCDataChannel.send` (it copies), but if you ever
> see corruption with >2 peers, send `packed.buffer.slice(0)` per peer.

### B6. Presence: from "them" to "everyone"

This is cosmetic-but-important. The UI has one remote tile (`tile-them`, `tag-them`,
`themInk`, `themMsgs`) and `effectiveRemoteRole()` assumes a single counterpart. With
N peers you have choices; the **minimum viable** version keeps one shared "remote"
view (treat all remotes as one collective "PEERS") and just shows a count. The **nice**
version renders a tile per peer.

**Minimum viable (recommended first pass):**

- Cursor (`C` op): today `theirNode=rest`. Instead store per-peer in the conn, and let
  `theirNode` mean "most recent remote cursor" for the existing single-tile UI:
  ```js
  // in onControl, op==='C':
  if(op==='C'){
    theirNode=rest;                       // keep single-tile behavior
    // (optional) attribute to sender if you thread `from` into onControl — see note
    if(rest&&!nodes[rest])requestSync('unknown-cursor');
    renderStrip(); renderBranches();
    var tg=document.getElementById('tag-them');
    if(tg)tg.textContent = nodes[rest] ? ('PEERS f'+depthOf(rest)) : '\u2014';
    return;
  }
  ```
- `effectiveRemoteRole()` is used for labels and EDL. Make it return a generic:
  ```js
  function effectiveRemoteRole(){ return connList().length ? 'remote' : ''; }
  ```
- Presence summary helper (call it from `dropConn`/`reconcileRoster`):
  ```js
  function refreshPresence(){
    var n = connList().filter(function(c){return c.link&&c.link.kind==='webrtc';}).length;
    var ph = document.getElementById('ph-them'); if(ph) ph.classList.toggle('hidden', n>0);
    var lt = document.getElementById('label-them'); if(lt) lt.textContent = n>1 ? (n+' PEERS') : (n===1?'REMOTE':'REMOTE');
    var tg = document.getElementById('tag-them'); if(tg && n===0) tg.textContent='\u2014';
  }
  ```
- Chat: `themMsgs`/`themInk` become a shared bucket — every remote `M ` message lands
  there. That's already what `onControl` does; no change needed for MVP. (You lose
  per-author attribution in the collective ink, which is acceptable for v1.)

> **Threading `from` into onControl:** `onControl` is wired per-channel inside
> `makeWebRTC` via `ch.onmessage=function(e){ onControl(e.data); }`. To attribute
> cursors/chat per peer later, change that wire to pass the remote id:
> `ch.onmessage=function(e){ onControl(e.data, remoteId); }` — but `makeWebRTC` doesn't
> currently know `remoteId`. Pass it in: `makeWebRTC(pc, onFrame, isHost, remoteId)`
> and capture it. Then `onControl(data, fromId)` can do
> `conns[fromId].node = rest` for true per-peer cursors. Defer to the "nice" pass.

### B7. Snapshot / late-join sync (important correctness fix)

Today the **host** answers `R` (resync) requests via `sendSnapshot`, and the
control-channel `onopen` does `if(isHost)sendSnapshot(...)`. In mesh, "isHost" per
*connection* (the impolite side) is NOT the same as the room's canonical host. You want
the **room host** to be the source of truth for late joiners.

- In `makeWebRTC`'s control `onopen`, change the snapshot trigger from the per-conn
  `isHost` flag to the room role:
  ```js
  ch.onopen=function(){
    log('CTRL','open');
    if (room.role==='host') sendSnapshot('control-open'); else sendCtl('R');
    sendCursor();
  };
  ```
- In `onControl`, the `R` handler currently checks `isHostPeer`. Change to:
  ```js
  if(data==='R'){ if(room.role==='host') sendSnapshot('peer-request'); return; }
  ```
  (And the BRANCH-protocol `requestSync` already broadcasts via `sendCtl('R')`, which
  now fans out — every peer hears it, but only the host replies. Good.)

> Result: when peer #4 joins, its channels open, it emits `R`, the room host replies
> with a `Z` snapshot to everyone, and #4 converges. Because `sendSnapshot` uses
> `sendCtl` (now fan-out), the snapshot reaches all peers — slightly wasteful but
> correct and bounded by your tree size.

### B8. Hangup / leave cleanup

`hang` closes the single `pc`. Make it close all:
**Find** in the hang handler:
```js
if(pc){try{pc.close();}catch(e){}pc=null;}link=makeLoopback(function(){});
```
**Replace with:**
```js
Object.keys(conns).forEach(function(id){ try{conns[id].pc.close();}catch(e){} });
conns = Object.create(null);
if(pc){try{pc.close();}catch(e){}pc=null;}
link=makeLoopback(function(){});
```

### B9. initializeRoomPeer / maybeStartHostOffer become no-ops (or thin)

These two assumed the single-pc handshake. In mesh:
- `initializeRoomPeer()` → its job is now done by `reconcileRoster` per poll. You can
  reduce it to a roster kick:
  ```js
  function initializeRoomPeer(){ /* mesh: conns are managed by reconcileRoster */ }
  ```
- `maybeStartHostOffer(peerCount)` → **delete its body**; offers are driven by
  `onnegotiationneeded` per conn. Replace calls to it with `Promise.resolve()`:
  ```js
  function maybeStartHostOffer(){ return Promise.resolve(); }
  ```
  (Leaving the function defined avoids touching its ~3 call sites.)

---

## Test ladder (do them in order)

1. **2 peers, automatic room** — confirm nothing regressed. Edits propagate, chat works,
   one tile shows REMOTE. This exercises the whole mesh path with N=2.
2. **3rd peer joins** — the two existing peers should each open a conn to #3
   (watch the log for two `MESH offer`/`answer` pairs). #3 emits `R`, host sends `Z`,
   #3's tree matches. `label-them` reads "2 PEERS".
3. **Glare test** — have two peers join within the same second. Perfect negotiation
   should resolve it (look for `ignored colliding offer` on exactly one side). No stuck
   `have-local-offer` states.
4. **Host drops** — kill the host tab. Worker `reconcilePeers` promotes the oldest
   member (epoch bumps), every client calls `rebuildAllConns`, mesh re-forms, new host
   answers future `R`s.
5. **Edit storm** — all peers extend/draw simultaneously. Because deltas are
   node-addressed, they converge regardless of arrival order. Watch `MAX_MSGS`
   pressure in the Worker (256 should hold ≤5 peers).
6. **Strict-NAT pair** — force one peer onto cellular. Confirm that pair uses the
   Cloudflare TURN relay (your `/turn` creds) while the others stay direct.

## Scaling note

Mesh upload cost per peer = (N−1) copies of every frame delta. Your deltas are tiny
(dot-matrix command lines), so 5 peers is trivial bandwidth. The real ceiling is
RTCPeerConnection count and mobile CPU, not your data. If you ever need 8+ or a
"broadcast to audience" mode, that's the Cloudflare SFU rebuild — different API, metered
egress past 1,000 GB/mo, and worth its own session.
