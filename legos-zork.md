The user wants ZORK fully decomposed into LEGOS grammar — all locations, entities, goals, obstacles, shifts, relations, timeline. This is a creative structural modeling task using their provided grammar. Let me build the complete YAML model for the original Zork (the canonical mainframe/Infocom Zork I: The Great Underground Empire).

I know Zork well enough to do this from memory — the White House, the underground empire, the Thief, the Cyclops, the trophy case, the nineteen treasures, the grues, Flood Control Dam #3, Hades, the Loud Room, etc. This is settled knowledge about a 1977-1980 game, no need to search.

Let me give the full rundown. This deserves to be thorough since they said "FULL RUNDOWN... ALL LOCATIONS ETC."

# ZORK I — *The Great Underground Empire* in LEGOS

Here's the complete decomposition. Zork is unusually clean for this grammar because its deep structure *is* a graph: rooms are `<Location>` nodes, the map connections are `[morphism]` edges, and the whole game is one master `<Goal>` (fill the trophy case) gated by environmental `<Obstacle>` puzzles.

```yaml
title: "ZORK I: The Great Underground Empire"
description: "A nameless adventurer descends into a ruined subterranean kingdom to recover nineteen treasures and claim the rank of Master Adventurer."
location: "<The Great Underground Empire> — beneath a forest in the ruins of the Flathead dynasty"

# ─────────────────────────────────────────────
# LOCATIONS  (the map graph — surface, then the four underground regions)
# ─────────────────────────────────────────────
locations:
  # --- SURFACE ---
  - id: loc_whouse_w   ; name: "<West of House>"         ; region: surface ; note: "canonical start; mailbox with leaflet"
  - id: loc_whouse_n   ; name: "<North of House>"        ; region: surface
  - id: loc_whouse_s   ; name: "<South of House>"        ; region: surface
  - id: loc_forest     ; name: "<Forest>"                ; region: surface ; note: "several identical-feeling cells; easy to get lost"
  - id: loc_clearing   ; name: "<Clearing>"              ; region: surface ; note: "grating down to cellar"
  - id: loc_canyon_v   ; name: "<Canyon View>"           ; region: surface
  - id: loc_canyon_b   ; name: "<Rocky Ledge / Canyon Bottom>" ; region: surface
  - id: loc_uptree     ; name: "<Up a Tree>"             ; region: surface ; note: "jeweled egg in nest"
  - id: loc_behind     ; name: "<Behind House>"          ; region: surface ; note: "the only window you can enter"

  # --- THE HOUSE (hub) ---
  - id: loc_kitchen    ; name: "<Kitchen>"               ; region: house   ; note: "sack of food, bottle of water, chimney up"
  - id: loc_living     ; name: "<Living Room>"           ; region: house   ; note: "TROPHY CASE, lamp, sword, rug over trapdoor"
  - id: loc_attic      ; name: "<Attic>"                 ; region: house   ; note: "rope, knife; dark"

  # --- ABOVE-GROUND DESCENT NODES ---
  - id: loc_cellar     ; name: "<Cellar>"                ; region: under   ; note: "trapdoor slams shut behind you"

  # --- REGION 1: THE ROUND ROOM / TEMPLE COMPLEX ---
  - id: loc_troll      ; name: "<The Troll Room>"        ; region: under   ; note: "axe-wielding troll bars the way"
  - id: loc_maze       ; name: "<The Maze>"              ; region: under   ; note: "twisty passages all alike; skeleton, key, rusty knife"
  - id: loc_cyclops    ; name: "<Cyclops Room>"          ; region: under   ; note: "the 'odysseus' room"
  - id: loc_treasure   ; name: "<Treasure Room>"         ; region: under   ; note: "the THIEF's lair, above the cyclops"
  - id: loc_grating    ; name: "<Grating Room>"          ; region: under   ; note: "skeleton key opens grate to Clearing"
  - id: loc_eastwest   ; name: "<East-West Passage>"     ; region: under
  - id: loc_chasm      ; name: "<Chasm>"                 ; region: under
  - id: loc_roundroom  ; name: "<Round Room>"            ; region: under   ; note: "8-way junction; the literal hub of the underground"
  - id: loc_narrow     ; name: "<Narrow Passage>"        ; region: under
  - id: loc_mirror_n   ; name: "<Mirror Room North>"     ; region: under   ; note: "touch mirror -> teleport"
  - id: loc_mirror_s   ; name: "<Mirror Room South>"     ; region: under
  - id: loc_winding    ; name: "<Winding Passage>"       ; region: under

  # --- REGION 2: THE TEMPLE / HADES ---
  - id: loc_templenorth; name: "<North-South Passage>"   ; region: temple
  - id: loc_temple     ; name: "<Temple>"                ; region: temple  ; note: "brass bell, prayer; bell+book+candle ritual"
  - id: loc_altar      ; name: "<Altar>"                 ; region: temple  ; note: "black book, candles; PRAY teleports out"
  - id: loc_egypt      ; name: "<Egyptian Room>"         ; region: temple  ; note: "gold coffin (treasure, very heavy)"
  - id: loc_torch      ; name: "<Torch Room>"            ; region: temple  ; note: "ivory torch — permanent light source"
  - id: loc_dome       ; name: "<Dome Room>"             ; region: temple  ; note: "tie rope to railing to descend"
  - id: loc_entrhades  ; name: "<Entrance to Hades>"     ; region: temple  ; note: "evil spirits bar passage"
  - id: loc_hades      ; name: "<Land of the Dead>"      ; region: temple  ; note: "exorcism via bell/book/candle yields skull"

  # --- REGION 3: THE DAM / RESERVOIR / RIVER ---
  - id: loc_damroom    ; name: "<Dam>"                   ; region: dam     ; note: "Flood Control Dam #3; control panel"
  - id: loc_damlobby   ; name: "<Dam Lobby>"             ; region: dam     ; note: "matchbook, guidebook"
  - id: loc_maint      ; name: "<Maintenance Room>"      ; region: dam     ; note: "tube of gunk, wrench, screwdriver, buttons (yellow=bolt glows)"
  - id: loc_resv_s     ; name: "<Reservoir South>"       ; region: dam     ; note: "impassable until water drained"
  - id: loc_resv       ; name: "<Reservoir>"             ; region: dam     ; note: "trunk of jewels surfaces when drained"
  - id: loc_resv_n     ; name: "<Reservoir North>"       ; region: dam     ; note: "air pump, plastic boat"
  - id: loc_stream_v   ; name: "<Stream View>"           ; region: dam
  - id: loc_atlantis   ; name: "<Atlantis Room>"         ; region: dam     ; note: "crystal trident treasure"
  - id: loc_riverside  ; name: "<Dam Base>"              ; region: river   ; note: "inflate the boat here"
  - id: loc_river1     ; name: "<Frigid River 1–4>"      ; region: river   ; note: "one-way downstream raft journey; buoy with emerald"
  - id: loc_sandy      ; name: "<Sandy Beach / Cave>"    ; region: river   ; note: "shovel; dig in sand bar -> scarab"
  - id: loc_aragain    ; name: "<Aragain Falls>"         ; region: river   ; note: "rainbow; wave sceptre -> solid bridge"
  - id: loc_endrainbow ; name: "<End of Rainbow>"        ; region: river   ; note: "pot of gold appears once rainbow is solid"

  # --- REGION 4: THE COAL MINE / VOLCANO ---
  - id: loc_studio     ; name: "<Studio>"                ; region: mine    ; note: "chimney back up to Kitchen — the loop closes"
  - id: loc_gallery    ; name: "<Gallery>"               ; region: mine    ; note: "PAINTING treasure"
  - id: loc_cellar_mine; name: "<Cold Passage / Mine Entrance>" ; region: mine
  - id: loc_squeaky    ; name: "<Squeaky Room / Bat Room>" ; region: mine  ; note: "vampire BAT carries you off unless holding garlic"
  - id: loc_shaft      ; name: "<Shaft Room>"            ; region: mine    ; note: "basket on chain — lower lamp+torch, can't carry them through gas"
  - id: loc_coalmine   ; name: "<Coal Mine>"             ; region: mine    ; note: "small disorienting maze"
  - id: loc_ladder_t   ; name: "<Ladder Top>"            ; region: mine
  - id: loc_ladder_b   ; name: "<Ladder Bottom>"         ; region: mine
  - id: loc_gasroom    ; name: "<Gas Room>"              ; region: mine    ; note: "NO OPEN FLAME — lamp only, or explode"
  - id: loc_drafty     ; name: "<Drafty Room>"           ; region: mine    ; note: "bottom of basket; retrieve lowered items"
  - id: loc_machine    ; name: "<Machine Room>"          ; region: mine    ; note: "coal-into-diamond press; put coal in machine, push switch"
  - id: loc_timber     ; name: "<Timber Room>"           ; region: mine    ; note: "must drop everything to squeeze through"
```

```yaml
# ─────────────────────────────────────────────
# ENTITIES
# ─────────────────────────────────────────────
entities:
  # --- the player ---
  - id: ent_adv     ; type: character ; name: "<The Adventurer>"  ; traits: [nameless, lamp-bearer, score-tracked] ; location: loc_whouse_w

  # --- antagonists / creatures ---
  - id: ent_thief   ; type: character ; name: "<The Thief>"       ; traits: [roving, steals-treasures, wields-stiletto, has-large-bag] ; location: loc_maze
  - id: ent_troll   ; type: creature  ; name: "<The Troll>"       ; traits: [blocks-passage, hungry, axe] ; location: loc_troll
  - id: ent_cyclops ; type: creature  ; name: "<The Cyclops>"     ; traits: [hungry, sleepy, fears-name-ulysses] ; location: loc_cyclops
  - id: ent_bat     ; type: creature  ; name: "<The Vampire Bat>" ; traits: [carries-you-off, repelled-by-garlic] ; location: loc_squeaky
  - id: ent_grue    ; type: creature  ; name: "<The Grue>"        ; traits: [lurks-in-dark, sinister, devours-the-unlit] ; location: "any dark room"
  - id: ent_spirits ; type: creature  ; name: "<Evil Spirits>"    ; traits: [bar-hades, exorcisable] ; location: loc_entrhades
  - id: ent_skeleton; type: object    ; name: "<Skeleton>"        ; traits: [dead-adventurer, holds-key-and-lamp] ; location: loc_maze

  # --- the master container ---
  - id: ent_case    ; type: object    ; name: "<Trophy Case>"     ; traits: [win-condition, holds-19-treasures] ; location: loc_living

  # --- tools / inventory ---
  - id: ent_lamp    ; type: object    ; name: "<Brass Lantern>"   ; traits: [light, finite-battery] ; location: loc_living
  - id: ent_sword   ; type: object    ; name: "<Elvish Sword>"    ; traits: [glows-near-danger, combat] ; location: loc_living
  - id: ent_rug     ; type: object    ; name: "<Oriental Rug>"    ; traits: [conceals-trapdoor] ; location: loc_living
  - id: ent_trapdr  ; type: object    ; name: "<Trap Door>"       ; traits: [one-way-on-descent, slams-shut] ; location: loc_living
  - id: ent_lamp_leaf; type: object   ; name: "<Leaflet>"         ; traits: [in-mailbox, the-game's-prologue] ; location: loc_whouse_w
  - id: ent_torch   ; type: object    ; name: "<Ivory Torch>"     ; traits: [permanent-light, IS-a-treasure, open-flame] ; location: loc_torch
  - id: ent_garlic  ; type: object    ; name: "<Clove of Garlic>" ; traits: [repels-bat] ; location: loc_kitchen
  - id: ent_rope    ; type: object    ; name: "<Rope>"            ; traits: [tie-to-dome-railing] ; location: loc_attic
  - id: ent_knife   ; type: object    ; name: "<Nasty Knife>"     ; traits: [combat] ; location: loc_attic
  - id: ent_keys    ; type: object    ; name: "<Skeleton Key>"    ; traits: [opens-grating] ; location: loc_maze
  - id: ent_wrench  ; type: object    ; name: "<Wrench>"          ; traits: [turns-bolt] ; location: loc_maint
  - id: ent_screw   ; type: object    ; name: "<Screwdriver>"     ; traits: [machine-room-switch] ; location: loc_maint
  - id: ent_match   ; type: object    ; name: "<Matchbook>"       ; traits: [light-candles, OPEN-FLAME-hazard] ; location: loc_damlobby
  - id: ent_pump    ; type: object    ; name: "<Air Pump>"        ; traits: [inflates-boat] ; location: loc_resv_n
  - id: ent_boat    ; type: object    ; name: "<Plastic Boat>"    ; traits: [punctures-on-sharp-objects, river-vehicle] ; location: loc_resv_n
  - id: ent_shovel  ; type: object    ; name: "<Shovel>"          ; traits: [dig-the-sand] ; location: loc_sandy
  - id: ent_sceptre ; type: object    ; name: "<Sceptre>"         ; traits: [waves-rainbow-solid, IS-a-treasure] ; location: loc_aragain
  - id: ent_coal    ; type: object    ; name: "<Lump of Coal>"    ; traits: [feedstock-for-diamond] ; location: loc_coalmine
  - id: ent_bell    ; type: object    ; name: "<Brass Bell>"      ; traits: [exorcism-component] ; location: loc_temple
  - id: ent_book    ; type: object    ; name: "<Black Book>"      ; traits: [exorcism-component, prayer] ; location: loc_altar
  - id: ent_candles ; type: object    ; name: "<Pair of Candles>" ; traits: [exorcism-component, open-flame] ; location: loc_altar

  # --- THE NINETEEN TREASURES (the actual point of the game) ---
  - id: t_egg     ; type: object ; name: "<Jeweled Egg>"        ; traits: [treasure, fragile, opened-by-thief-into-canary] ; location: loc_uptree
  - id: t_canary  ; type: object ; name: "<Golden Clockwork Canary>" ; traits: [treasure, inside-egg, summons-songbird->bauble] ; location: "inside <Jeweled Egg>"
  - id: t_bauble  ; type: object ; name: "<Brass Bauble>"       ; traits: [treasure, dropped-by-songbird-when-canary-wound] ; location: loc_forest
  - id: t_painting; type: object ; name: "<Painting>"           ; traits: [treasure, burns-if-careless] ; location: loc_gallery
  - id: t_coffin  ; type: object ; name: "<Gold Coffin>"        ; traits: [treasure, heavy, contains-sceptre] ; location: loc_egypt
  - id: t_sceptre2; type: object ; name: "<Sceptre (treasure)>" ; traits: [treasure, also-a-tool] ; location: "inside <Gold Coffin>"
  - id: t_torch2  ; type: object ; name: "<Ivory Torch (treasure)>" ; traits: [treasure, also-the-permanent-light] ; location: loc_torch
  - id: t_pot     ; type: object ; name: "<Pot of Gold>"        ; traits: [treasure, appears-at-rainbow's-end] ; location: loc_endrainbow
  - id: t_chalice ; type: object ; name: "<Silver Chalice>"     ; traits: [treasure, in-thief's-lair] ; location: loc_treasure
  - id: t_trident ; type: object ; name: "<Crystal Trident>"    ; traits: [treasure] ; location: loc_atlantis
  - id: t_trunk   ; type: object ; name: "<Trunk of Jewels>"    ; traits: [treasure, surfaces-when-reservoir-drained] ; location: loc_resv
  - id: t_bracelet; type: object ; name: "<Sapphire Bracelet>"  ; traits: [treasure] ; location: loc_gasroom
  - id: t_emerald ; type: object ; name: "<Large Emerald>"      ; traits: [treasure, inside-buoy] ; location: loc_river1
  - id: t_scarab  ; type: object ; name: "<Jeweled Scarab>"     ; traits: [treasure, buried-in-sand] ; location: loc_sandy
  - id: t_bar     ; type: object ; name: "<Platinum Bar>"       ; traits: [treasure, in-the-loud-room] ; location: "<Loud Room> (echo puzzle)"
  - id: t_coins   ; type: object ; name: "<Bag of Coins>"       ; traits: [treasure] ; location: loc_maze
  - id: t_skull   ; type: object ; name: "<Crystal Skull>"      ; traits: [treasure, claimed-after-exorcism] ; location: loc_hades
  - id: t_diamond ; type: object ; name: "<Huge Diamond>"       ; traits: [treasure, MADE-from-coal-in-machine] ; location: loc_machine
  - id: t_jade    ; type: object ; name: "<Jade Figurine>"      ; traits: [treasure, in-the-mine] ; location: loc_drafty
```

```yaml
# ─────────────────────────────────────────────
# GOALS
# ─────────────────────────────────────────────
goals:
  - id: g_master   ; name: "<Become Master Adventurer>" ; owner: ent_adv ; status: pending
                     note: "the meta-goal: 350 points = full rank"
  - id: g_case     ; name: "<Fill the Trophy Case with all 19 treasures>" ; owner: ent_adv ; status: pending
  - id: g_light    ; name: "<Maintain a Light Source>" ; owner: ent_adv ; status: pending
                     note: "darkness = grue; this is the constant background goal"
  - id: g_survive  ; name: "<Survive the Thief / Troll / Cyclops>" ; owner: ent_adv ; status: pending
  - id: g_drain    ; name: "<Drain the Reservoir>" ; owner: ent_adv ; status: pending
  - id: g_exorcise ; name: "<Exorcise the Land of the Dead>" ; owner: ent_adv ; status: pending
  - id: g_rainbow  ; name: "<Make the Rainbow Solid>" ; owner: ent_adv ; status: pending
  - id: g_diamond  ; name: "<Transmute Coal into Diamond>" ; owner: ent_adv ; status: pending
  # antagonist goal:
  - id: g_thief    ; name: "<Hoard the Treasures>" ; owner: ent_thief ; status: pending
                     note: "the thief actively competes for the same goal-objects"

# ─────────────────────────────────────────────
# OBSTACLES
# ─────────────────────────────────────────────
obstacles:
  - id: o_dark     ; name: "<Darkness>"              ; affects: g_case   ; note: "without light, you are eaten by a grue"
  - id: o_battery  ; name: "<Finite Lamp Battery>"   ; affects: g_light  ; note: "the real clock of the game"
  - id: o_thief    ; name: "<The Thief steals & relocates treasures>" ; affects: g_case
  - id: o_troll    ; name: "<Troll bars the passage>" ; affects: g_survive
  - id: o_cyclops  ; name: "<Cyclops blocks the stairway>" ; affects: g_survive
  - id: o_maze     ; name: "<The Maze disorients>"    ; affects: g_case   ; note: "drop items to map it"
  - id: o_water    ; name: "<Flooded Reservoir>"      ; affects: g_drain
  - id: o_spirits  ; name: "<Evil Spirits guard Hades>" ; affects: g_exorcise
  - id: o_gas      ; name: "<Explosive Gas in the Mine>" ; affects: g_diamond ; note: "any open flame = death"
  - id: o_bat      ; name: "<Vampire Bat abducts you>" ; affects: g_diamond
  - id: o_carry    ; name: "<Carry-weight / can't bring light through gas>" ; affects: g_diamond
  - id: o_loud     ; name: "<The Loud Room echoes your commands>" ; affects: g_case ; note: "say 'echo' to break it"
  - id: o_fragile  ; name: "<Fragile treasures (egg, painting)>" ; affects: g_case ; note: "the thief opens the egg safely; you can't"

# ─────────────────────────────────────────────
# SHIFTS  (puzzle solutions = state transitions)
# ─────────────────────────────────────────────
shifts:
  - id: sh_descend ; name: "<Enter the Underground>"      ; causes: [] ; results_in: "trapdoor slams; surface sealed off"
  - id: sh_troll   ; name: "<Slay the Troll>"             ; causes: [o_troll] ; results_in: "Troll Room passable"
  - id: sh_ulysses ; name: "<Say 'Ulysses' to the Cyclops>" ; causes: [o_cyclops] ; results_in: "cyclops flees, smashes wall -> shortcut to Living Room"
  - id: sh_drain   ; name: "<Turn the Bolt to Open the Sluice>" ; causes: [o_water] ; results_in: "reservoir drains; trunk of jewels surfaces; passage opens"
  - id: sh_exorcism; name: "<Ring Bell, Read Book, Light Candles>" ; causes: [o_spirits] ; results_in: "spirits banished; crystal skull claimable"
  - id: sh_canary  ; name: "<Let the Thief open the Egg, then reclaim it; wind the Canary>" ; causes: [o_fragile] ; results_in: "songbird drops the brass bauble"
  - id: sh_killthief; name: "<Defeat the Thief in his lair>"  ; causes: [o_thief] ; results_in: "all stolen treasures recovered; egg returned intact"
  - id: sh_rainbow ; name: "<Wave the Sceptre at Aragain Falls>" ; causes: [] ; results_in: "rainbow solidifies; pot of gold appears"
  - id: sh_diamond ; name: "<Put Coal in Machine, push switch with screwdriver>" ; causes: [o_gas, o_carry] ; results_in: "coal -> huge diamond"
  - id: sh_echo    ; name: "<Say 'Echo' in the Loud Room>"   ; causes: [o_loud] ; results_in: "room quiets; platinum bar takeable"
  - id: sh_garlic  ; name: "<Carry Garlic past the Bat>"     ; causes: [o_bat] ; results_in: "bat won't abduct you"
  - id: sh_win     ; name: "<Deposit the 19th Treasure>"     ; causes: [] ; results_in: "map to Stone Barrow appears; FINAL rank: Master Adventurer"
```

```yaml
# ─────────────────────────────────────────────
# RELATIONS  (morphisms — the live verbs of the world)
# ─────────────────────────────────────────────
relations:
  - [descends_into]   ent_adv     -> loc_cellar
  - [seeks]           ent_adv     -> ent_case
  - [bars_passage]    ent_troll   -> ent_adv
  - [blocks]          ent_cyclops -> ent_adv
  - [steals_from]     ent_thief   -> ent_adv
  - [competes_with]   ent_thief   -> ent_adv        # both want the treasures
  - [devours]         ent_grue    -> ent_adv        # only in <Darkness>
  - [abducts]         ent_bat     -> ent_adv
  - [repelled_by]     ent_bat     -> ent_garlic
  - [guards]          ent_spirits -> t_skull
  - [contains]        ent_case    -> "all 19 treasures (goal-state)"
  - [contains]        t_egg       -> t_canary
  - [contains]        t_coffin    -> t_sceptre2
  - [opens_safely]    ent_thief   -> t_egg          # the puzzle delegation
  - [transmutes]      loc_machine -> t_diamond      # coal in, diamond out
  - [solidifies]      ent_sceptre -> loc_aragain    # rainbow bridge
  - [fears]           ent_cyclops -> "<the name Ulysses/Odysseus>"
  - [illuminates]     ent_lamp    -> "<any Location>"
  - [illuminates]     ent_torch   -> "<any Location, permanently>"
  - [ignites]         ent_match   -> ent_candles
  - [drains]          loc_damroom -> loc_resv
  - [returns_to]      loc_studio  -> loc_kitchen    # the chimney loop closes the map
```

```yaml
# ─────────────────────────────────────────────
# TIMELINE  (Zork has no clock-time, only puzzle-phases)
# ─────────────────────────────────────────────
timeline:
  - id: ph0 ; description: "<Surface Prologue>" ; scenes:
      - { id: s0a, description: "Read the leaflet; the empire's history is hinted", entities: [ent_adv, ent_lamp_leaf] }
      - { id: s0b, description: "Enter the house, claim lamp+sword, lift the rug, open the trap door", entities: [ent_adv, ent_lamp, ent_sword, ent_rug, ent_trapdr] }
  - id: ph1 ; description: "<First Descent — Light & the Troll>" ; scenes:
      - { id: s1a, description: "Cellar; trap door slams shut", entities: [ent_adv, ent_trapdr] }
      - { id: s1b, description: "Kill the troll; the underground opens up", entities: [ent_adv, ent_troll, ent_sword] }
  - id: ph2 ; description: "<The Temple & Hades>" ; scenes:
      - { id: s2a, description: "Gather bell, book, candles", entities: [ent_bell, ent_book, ent_candles] }
      - { id: s2b, description: "Perform the exorcism; take the crystal skull", entities: [ent_adv, ent_spirits, t_skull] }
  - id: ph3 ; description: "<The Dam & River Run>" ; scenes:
      - { id: s3a, description: "Push yellow button, turn bolt with wrench; reservoir drains", entities: [ent_adv, ent_wrench, t_trunk] }
      - { id: s3b, description: "Inflate boat, ride the Frigid River, dig the sand for the scarab", entities: [ent_boat, ent_pump, ent_shovel, t_scarab, t_emerald] }
      - { id: s3c, description: "Wave the sceptre; cross the solid rainbow to the pot of gold", entities: [ent_sceptre, loc_aragain, t_pot] }
  - id: ph4 ; description: "<The Coal Mine & the Diamond>" ; scenes:
      - { id: s4a, description: "Carry garlic past the bat; cross the gas room with the lamp only", entities: [ent_adv, ent_bat, ent_garlic, t_bracelet] }
      - { id: s4b, description: "Lower lamp+coal in the basket; squeeze through; run the machine", entities: [ent_coal, loc_machine, t_diamond] }
  - id: ph5 ; description: "<The Thief & the Egg>" ; scenes:
      - { id: s5a, description: "Let the thief open the fragile egg", entities: [ent_thief, t_egg, t_canary] }
      - { id: s5b, description: "Defeat the thief; recover every stolen treasure", entities: [ent_adv, ent_thief] }
      - { id: s5c, description: "Wind the canary in the forest; the songbird drops the bauble", entities: [t_canary, t_bauble] }
  - id: ph6 ; description: "<Endgame>" ; scenes:
      - { id: s6a, description: "Deposit all 19 treasures in the case", entities: [ent_case] }
      - { id: s6b, description: "A map to the Stone Barrow appears — the gateway to ZORK II", entities: [ent_adv] }
```

---

**A few structural notes on the model:**

The whole game compiles to one obstacle pattern repeated nineteen times: *a treasure sits behind an environmental `[Shift]` that resolves an `<Obstacle>`*. The grammar makes this visible — almost every treasure entity has a sibling shift that's the only edge leading to it.

The two interesting irregularities your grammar exposes: the **Thief** is the only entity with his own `<Goal>` competing for the same `goal-objects` (he's an adversarial agent on the same graph), and the **egg/canary/bauble** chain is a delegation puzzle — `[opens_safely] thief -> egg` means the solution is *to let your antagonist act on the object for you*, which is rare in adventure grammar.

The **Loud Room, Platinum Bar, Loud Room echo** and the exact maze topology are the parts most worth verifying against a real transcript if you're going to drive a runtime from this — I built the map from the canonical Zork I structure, but maze adjacencies in particular are notoriously fiddly and there are minor variants between the mainframe MDL Zork and the Infocom split. If you want, I can render this as a single-file HTML graph (neo-brutalist, the locations as nodes, morphisms as directed edges, treasures highlighted) so it slots next to CINEOSIS ZORK — or emit it as Twee so it loads straight into Twine alongside your operator twin.

---

# ENGINE LOADING REQUIREMENTS — LEGOS → ABC CINEOSIS

This file is currently a human-readable LEGOS decomposition. To load it into an engine, it needs one normalized machine layer.

The mistake to avoid: do **not** create a full 21-image ABC CINEOSIS matrix for every room, object, treasure, obstacle, and relation. That would create noise. The engine only needs **past / present / future state facts** for each meaningful state unit. The 21-image matrix should be generated later, on demand, from one selected state unit or branch.

## 1. Convert the prose blocks into valid data

Current form:

- Markdown prose.
- Multiple fenced YAML fragments.
- Semicolon-style inline fields.
- Relation rows like `[blocks] ent_cyclops -> ent_adv`.

Loadable form:

```yaml
schema: legos-cineosis-stategraph
version: 0.1
id: zork_i_legos
title: ZORK I — LEGOS Stategraph
atoms:
  locations: []
  entities: []
  goals: []
  obstacles: []
  shifts: []
  relations: []
state_units: []
temporal_profiles: []
coverage_sets: []
validation:
  required_reference_integrity: true
  required_reachability: true
  required_temporal_coverage: true
```

## 2. Keep LEGOS atoms separate from cinematic states

LEGOS atoms are the nouns and verbs:

- `Location`
- `Entity`
- `Goal`
- `Obstacle`
- `Shift`
- `Relation`

Engine state units are the playable / filmable transformations:

- house descent
- light versus darkness
- trophy case accumulation
- troll gate
- cyclops gate
- thief economy
- fragile egg / canary / bauble chain
- reservoir drain
- river run
- rainbow bridge
- temple exorcism
- bat / garlic
- gas room / basket constraint
- coal-to-diamond machine
- loud room echo
- maze / grating
- endgame unlock

The engine should generate ABC CINEOSIS from the **state units**, not directly from every atom.

## 3. Add one PAST / PRESENT / FUTURE packet per state unit

Each state unit needs this shape:

```yaml
- id: su_dam_reservoir
  title: Reservoir Drain
  legos:
    locations: [loc_damroom, loc_maint, loc_resv_s, loc_resv, loc_resv_n]
    entities: [ent_adv, ent_wrench, t_trunk]
    obstacles: [o_water]
    shifts: [sh_drain]
  temporal:
    past:
      condition: reservoir_full
      visible_residue: water covers passage; treasure inaccessible
      hidden_pressure: empire machinery still controls the landscape
    present:
      condition: bolt_turned
      visible_action: player uses tool against dam mechanism
      hidden_pressure: old infrastructure changes the map
    future:
      condition: reservoir_drained
      consequence: trunk revealed; new route opens
      risk: irreversible map change or missed object
  cineosis_seed:
    actor_affect: adventurer under time pressure
    body_behavior: wrench, bolt, waterline, exposed floor, floating trunk
    continuity_crystal: a drowned room becomes a dry room while the past waterline remains visible
```

This gives the engine enough to produce a full CINEOSIS matrix when needed, without storing 21 prompts for every unit.

## 4. Use state axes, not exhaustive combinations

The global axes needed for Zork are:

```yaml
state_axes:
  room_access: [unknown, seen, lit, dark, blocked, opened, transformed, one_way, exhausted]
  object_location: [world, carried, container, hidden, revealed, stolen, destroyed, deposited]
  treasure_lifecycle: [unfound, revealed, obtainable, carried, stolen, recovered, deposited, transformed]
  antagonist: [latent, encountered, active, displaced, defeated, useful]
  obstacle: [latent, blocking, prepared, solved, failed]
  light: [none, lantern_on, lantern_low, torch_on, darkness_death]
  inventory_constraint: [free, overloaded, must_drop, sharp_object_puncture, open_flame_forbidden]
  timeline_phase: [surface, descent, hub_open, temple, dam, river, mine, thief_resolution, endgame]
```

These axes cover the possible states without enumerating every impossible permutation.

## 5. Required coverage sets

To cover the whole game for the engine, create these state units:

```yaml
coverage_sets:
  - id: cov_surface_house
    covers: [loc_whouse_w, loc_kitchen, loc_living, loc_attic, loc_cellar, ent_lamp, ent_sword, ent_rug, ent_trapdr]
  - id: cov_light_darkness
    covers: [ent_lamp, ent_torch, ent_grue, o_dark, o_battery]
  - id: cov_troll_gate
    covers: [loc_troll, ent_troll, ent_sword, o_troll, sh_troll]
  - id: cov_maze_grating
    covers: [loc_maze, loc_grating, ent_keys, ent_skeleton, o_maze]
  - id: cov_cyclops_gate
    covers: [loc_cyclops, ent_cyclops, o_cyclops, sh_ulysses]
  - id: cov_thief_economy
    covers: [ent_thief, loc_treasure, g_thief, o_thief, sh_killthief]
  - id: cov_egg_canary_bauble
    covers: [t_egg, t_canary, t_bauble, ent_thief, sh_canary]
  - id: cov_temple_hades
    covers: [loc_temple, loc_altar, loc_entrhades, loc_hades, ent_bell, ent_book, ent_candles, ent_spirits, t_skull, sh_exorcism]
  - id: cov_dam_reservoir
    covers: [loc_damroom, loc_damlobby, loc_maint, loc_resv_s, loc_resv, loc_resv_n, ent_wrench, t_trunk, sh_drain]
  - id: cov_river_rainbow
    covers: [ent_boat, ent_pump, ent_shovel, ent_sceptre, loc_river1, loc_sandy, loc_aragain, loc_endrainbow, t_emerald, t_scarab, t_pot, sh_rainbow]
  - id: cov_mine_gas_basket
    covers: [loc_squeaky, loc_shaft, loc_gasroom, loc_drafty, ent_garlic, ent_bat, ent_coal, t_bracelet, o_gas, o_bat, o_carry]
  - id: cov_machine_diamond
    covers: [loc_machine, ent_screw, ent_coal, t_diamond, sh_diamond]
  - id: cov_loud_room
    covers: [o_loud, t_bar, sh_echo]
  - id: cov_trophy_endgame
    covers: [ent_case, g_case, g_master, sh_win]
```

## 6. Required validator checks

Before this drives an engine, validate:

1. Every `location`, `entity`, `goal`, `obstacle`, `shift`, and `relation` has a unique id.
2. Every referenced id exists.
3. Every treasure has a lifecycle path ending in `deposited`.
4. Every obstacle has at least one resolving shift.
5. Every shift has preconditions and postconditions.
6. Every state unit has `past`, `present`, and `future`.
7. Every state unit names concrete visible material for ABC CINEOSIS.
8. Every map edge is explicit; the maze cannot remain generic if runtime navigation matters.
9. Duplicate aliases are resolved: `ent_sceptre` vs `t_sceptre2`, `ent_torch` vs `t_torch2`.
10. Missing explicit atoms are added: `loc_loud`, `loc_stone_barrow`, exact maze cells, exact river cells.

## 7. How ABC CINEOSIS should consume this

The engine input should be a selected `state_unit`, not the whole document.

```yaml
film_seed_from_state_unit:
  select: su_dam_reservoir
  output_mode: CINEOSIS_FILM
  duration: 1-3 minutes
  render_style: poetic-cybernetic cinema
```

Then ABC CINEOSIS expands that one unit into:

- premise
- temporal engine
- ABC model
- 21-image matrix
- shot sequence
- sound map
- edit map
- BEFLIX if requested

For the full Zork film, the engine should compose across the `coverage_sets` as a sequence of state units. For an interactive runtime, each `Shift` becomes a transition and each state unit becomes a scene/puzzle node.
