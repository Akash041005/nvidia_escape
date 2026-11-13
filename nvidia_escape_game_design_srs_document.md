# Software Requirements Specification (SRS)
## Nvidia Escape: Silicon Valley Run
*3D Endless Runner Web Application — Architecture, Mechanics & Autonomous Build Specification*

---

> **Project Goal:** Build a zero-dependency, browser-playable 3D parody endless runner game inspired by *Subway Surfers* using **Next.js (App Router)** and **Three.js**, requiring zero external 3D model files, zero audio assets, and no backend authentication or database.

---

## 1. System Architecture & Technical Stack
The entire application runs client-side in the browser so that any AI coding agent can scaffold, build, and launch the playable game autonomously in a single workspace.

| Layer | Technology Selection | Implementation Strategy |
| :--- | :--- | :--- |
| **Application Framework** | Next.js (App Router, TypeScript) | Single-page game viewport with Tailwind CSS overlay HUD. |
| **3D Rendering Engine** | Three.js (`@react-three/fiber`, `@react-three/drei`) | Procedural stylized 3D Chibi meshes and dynamic HTML5 Canvas textures. |
| **Audio Synthesis** | Browser Web Audio API | Procedural sound effects (jump, wafer chime, crash, rocket boost, shield) without external MP3 files. |
| **Persistence & Auth** | Browser `localStorage` | No login/signup required. Stores All-Time High Stock Price ($Nvidia) and Best Distance locally. |

---

## 2. Core Gameplay & Chase Mechanics
The game uses a third-person chase camera positioned behind and slightly above the runner on an infinite, scrolling 3-lane circuit-board highway (`Left = -2.5`, `Center = 0`, `Right = +2.5`).

* **The Runner (Player):** Recognisable 3D Chibi **Jensen Huang** featuring white hair geometry, glasses, an iconic black leather jacket, and a stylized cartoon face texture.
* **The Hunter (Chaser):** Recognisable 3D Chibi **Chinese PM** pursuing Jensen from behind. At game start and upon minor obstacle stumbles, the Hunter closes the distance at the bottom of the screen. A second consecutive stumble or a direct head-on collision without a shield triggers capture and **Game Over**.
* **Controls & Physics:** Smooth horizontal lane interpolation via `ArrowLeft/A` or `ArrowRight/D` (plus touch swipe); parabolic jump arc via `ArrowUp/W/Space`; temporary hitbox compression (slide/duck) via `ArrowDown/S`. Forward velocity scales progressively with distance.

---

## 3. Cast, Obstacles & Lane Hazards
Every obstacle wave must guarantee at least one solvable path (lane switch, jump, or slide). All text signs and vehicle graphics are rendered onto 3D meshes using dynamic Canvas textures.

| Game Element | Visual & Character Design | Player Interaction |
| :--- | :--- | :--- |
| **Media Channel Vans** *(Train Equivalents)* | Large blocky 3D news broadcast vans featuring **CNBC**, **Bloomberg**, and **WSJ** branding with red breaking-news tickers. | Switch lanes to dodge; optional ramp vans allow roof-running across consecutive vans. |
| **Nvidia Board Members** *(Placard Barrier)* | Chibi executives in business suits holding wide placards reading **"YOU'RE FIRED!"**. | Jump over low-held signs or slide underneath elevated signs. |
| **Girlfriends / Affairs** *(Protest Barrier)* | Chibi characters holding protest banners reading **"WE WANT JUSTICE!"**. | Jump, slide, or change lanes depending on barrier height. |
| **Wife (Lori)** *(Legal Barrier)* | Chibi character holding an oversized legal banner reading **"I WANT DIVORCE - $75 BILLION"**. | High-visibility lane hazard requiring timely jump, slide, or dodge. |

---

## 4. Collectibles, Stock Graph & Power-Ups

### 4.1 Dynamic Nvidia Stock Market Scoring
* **Silicon Wafers:** Glowing metallic rainbow discs spawned in lane lines and jump arcs replace traditional coins.
* **Live Stock Ticker HUD:** Starting at **$100.00**, collecting Silicon Wafers (`+$2.50` each) and covering distance drives a real-time green line/candlestick chart upward. Minor stumbles trigger a sharp red candle drop (`-$15.00`). Reaching `$0.00` causes immediate delisting (**Game Over**).

### 4.2 Special Cameo Power-Ups
* **Elon Musk — SpaceX Rocket Boost (8 Seconds):** Triggered by touching a Chibi Elon token next to a low-poly Cybertruck. Attaches a flaming SpaceX rocket to Jensen's back, launching him above all obstacles while spawning dense wafer trails across all three lanes.
* **Donald Trump — Tariff & Bailout Shield (10 Seconds):** Triggered by touching a golden-aura Chibi Trump token. Surrounds Jensen with an invincible golden shield and floating text (*"FAKE NEWS! PROTECTED!"*), blasting away any collided News Vans or banners for bonus stock points.

---

## 5. User Interface & Screen Flow
* **Start Overlay:** Displays the title *"NVIDIA ESCAPE: SILICON VALLEY RUN"* over the live idle 3D highway, control hints, saved All-Time High Stock badge, and a **START RUNNING** button.
* **In-Game HUD:** Top-left live Nvidia Stock Price and animated chart; top-right active power-up countdown bar and Web Audio mute toggle.
* **Game Over Screen:** Satirical financial crash summary displaying Peak Stock Price, Silicon Wafers Collected, All-Time High record, and an instant **PLAY AGAIN** button.

---

## 6. Ready-to-Use AI Builder Master Prompt
Paste the exact specification below into your AI coding agent inside an empty workspace folder to generate and launch the complete game automatically:

```text
Build a complete, playable 3D endless runner web game titled "Nvidia Escape: Silicon Valley Run" using Next.js (App Router, TypeScript), Tailwind CSS, and Three.js (@react-three/fiber, @react-three/drei).

STRICT CONSTRAINTS:
1. Zero external assets: Generate all 3D Chibi characters, faces, text signs, and news vans procedurally using Three.js geometries and HTML5 Canvas dynamic textures. Generate all sound effects synthetically via the Web Audio API.
2. No authentication or external database: Persist All-Time High Stock Price ($Nvidia) and Best Distance in browser localStorage.
3. Initialize the project, install dependencies, write clean modular code, and start the dev server.

GAMEPLAY SPECIFICATION:
- 3-lane infinite circuit-board highway (Left = -2.5, Center = 0, Right = +2.5) with third-person camera, keyboard (WASD/Arrows/Space) + touch swipe controls, jump, slide, and progressive speed scaling.
- Runner: Chibi Jensen Huang (white hair, glasses, black leather jacket, cartoon face texture).
- Hunter (Chaser): Chibi Chinese PM chasing behind Jensen; catches player on consecutive stumbles or unshielded head-on crashes.
- Obstacles:
  1. Media Channel Vans ("CNBC BREAKING", "BLOOMBERG LIVE", "WSJ NEWS" Canvas textures) to lane-dodge.
  2. Nvidia Board Members holding "YOU'RE FIRED!" placards (jump/slide).
  3. Girlfriends holding "WE WANT JUSTICE!" banners (jump/slide).
  4. Wife Lori holding "I WANT DIVORCE - $75 BILLION" banner (jump/slide).
- Collectibles & Score: Rainbow metallic Silicon Wafers. Live top-left Nvidia Stock Price ($100.00 start) + animated mini chart that rises on wafer pickup (+$2.50) and drops on stumbles (-$15.00).
- Power-Ups:
  1. Elon Musk + Cybertruck token: 8s SpaceX Rocket flight above obstacles with raining wafers.
  2. Donald Trump golden token: 10s invincible Tariff Shield ("FAKE NEWS! PROTECTED!") that blasts obstacles away for bonus stock points.
- Complete Start Overlay, In-Game HUD (stock graph, power-up timer, mute button), and Game Over modal with instant restart.
```