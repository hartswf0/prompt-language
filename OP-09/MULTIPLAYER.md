# OP-09 Multiway Plan

OP-09 is the fork where two-person Operator becomes a multiway preproduction room.

## What exists in this fork

- OP-08 studio copied into `OP-09/`.
- Separate Worker deployment name: `beflix-call-op09`.
- New Worker state-room namespace:

```text
/op9/:room/join
/op9/:room/send
/op9/:room/poll
/op9/:room/snapshot
/op9/:room/leave
/op9/:room/ops
```

- OP-09 state rooms allow up to 12 peers.
- Participants get stable room IDs (`P01`, `P02`, `P03`...) and server-assigned colors.
- Messages are stamped as bounded append-only operations.
- Snapshots are bounded shared room documents for late joiners and reconnect recovery.

## What this supports now

This supports 3+ person **state collaboration**:

- stable participant IDs and colors;
- per-frame authorship by `authorId`;
- shared room chat independent from WebRTC;
- cursor / presence / selected frame messages;
- colored participant roster, timeline markers, branch graph markers, and canvas cursors;
- append-only operation log with `seq`, `opId`, `authorId`, and `time`;
- branch-tree snapshots for late joiners;
- operation replay after the last snapshot;
- conflict preservation by forking concurrent edits instead of overwriting.

## What was making the old collaboration unreliable

OP-08 and earlier were closer to a two-person video call with a shared sketch payload than to Google Docs. The concrete weak points were:

- Identity was role-based instead of participant-based.
- Authorship was too coarse: mostly `ME` or `PEER`.
- Presence was single-remote only: one `theirNode` and one `theirPen`.
- The active document lived mostly inside browsers.
- State and media were coupled too tightly.
- Concurrent edits could silently overwrite.
- The handshake is still host/guest biased. A room link should reset the client into a clean role-specific join path, and host readiness should be visible as room state instead of a confusing retry loop.

OP-09 fixes the document-state part. The remaining host/guest bias is in the two-person media handshake, not in the `/op9` document room.

## Google Docs layer

The reliable collaboration layer should be document-first:

```js
roomDoc = {
  roomId,
  version,
  participants: {
    P01: { peerId, reconnectId, name, color, role, lastSeen, activeNode, selectedFrames, cursor },
    P02: { peerId, reconnectId, name, color, role, lastSeen, activeNode, selectedFrames, cursor }
  },
  tree: {
    root,
    activeByParticipant: { P01: "node-a", P02: "node-b" },
    nodes: {
      "node-a": { parent, kids, authorId, createdBy, updatedBy, grid, commands, version }
    }
  },
  chat: [],
  ops: []
}
```

Every edit should be an append-only operation with enough information to replay, debug, and export:

```js
{
  seq: 1284,
  opId: "P02-0001284",
  authorId: "P02",
  type: "node-edit",
  nodeId: "node-a",
  baseVersion: 17,
  patch: ["PNT 10 10 3 3 7"],
  at: "2026-06-25T12:34:56.000Z"
}
```

The UI needs to visualize that model:

- participant roster with stable colors visible at all times;
- colored active-frame markers for every person, not only “them”;
- colored cursors and drawing ghosts on the canvas;
- per-frame author badges;
- branch graph showing who is on which branch;
- EDL rows with `authorId`, color, time, operation type, and branch address;
- filters for “show me P01 edits”, “show me guest edits”, “show conflicts”, and “show unreviewed branches”;
- chat attached to room state, not just the peer connection.

## Reliability rules

- The Worker/Durable Object is the room authority for state. Browsers are clients.
- A reconnect sends `reconnectId` and `lastSeq`; the Worker returns missed ops.
- A late join receives the latest snapshot and then all ops after that snapshot.
- A room can remain editable when media is disconnected.
- A host leaving must not erase the document. It can end the two-person media path, but the room state persists until expiry.
- The client should save local unsent ops and flush them after reconnect.
- Imports from `.twee`, `.json`, `.bfx`, and raw BEFLIX should become room operations/snapshots when connected, not just local browser state.

## What this does not solve yet

It does not make 3+ person video/audio work by itself.

The current Operator media layer is still one WebRTC peer connection between two people. OP-09 deliberately keeps 3+ collaboration at the document-state layer until an SFU is added. Do not use P2P mesh beyond two participants; each extra participant multiplies uploads and causes the exact stutter/drop behavior we have already seen.

## Target architecture

```text
OP-09 browser
  ├─ local BEFLIX editor
  ├─ participant roster P01/P02/P03...
  ├─ state sync via /op9 room
  └─ optional media

Cloudflare Worker + Durable Object
  ├─ /op9/:room/join
  ├─ /op9/:room/send
  ├─ /op9/:room/poll
  ├─ /op9/:room/snapshot
  └─ /turn

Cloudflare Realtime SFU or equivalent
  └─ 3+ audio/video routing
```

## Remaining implementation pass

1. Add a real SFU media route for 3+ audio/video.
2. Add server-retained local unsent-op recovery for browser crashes.
3. Add UI filters for “show P01 edits”, “show conflicts”, and “show unreviewed branches”.
4. Replace the remaining host/guest call sheet language with room-first copy.
