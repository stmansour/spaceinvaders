# Space Invaders (1978) — Design & Terminology Reference Guide

This document defines the canonical terms, components, characters, mechanics, and design specifications for the classic 1978 arcade game **Space Invaders**, created by **Tomohiro Nishikado** and released by **Taito** in Japan and licensed to **Midway Games** in North America.

---

## 1. Executive Summary & Design Heritage

- **Original Title**: Space Monster (スペースモンスター) — renamed to *Space Invaders* prior to release.
- **Designer & Engineer**: Tomohiro Nishikado (西角 友宏)
- **Original Release**: June 1978 (Taito, Japan), October 1978 (Midway, North America)
- **Hardware Architecture**: Intel 8080 CPU @ 1.99 MHz, 7KB ROM, 1KB RAM, 7KB monochrome framebuffer (224 × 260 / rotated 256 × 224 vertical display).
- **Color Overlay**: The original arcade cabinets used a black & white monitor with colored cellophane strips overlaid on the glass:
  - **Top strip (Red)**: Mystery Ship area and top HUD scores.
  - **Middle area (Clear / White)**: Alien invader marching grid.
  - **Bottom strip (Green)**: Player Laser Cannon, Defense Bunkers, and ground line.
  - Later versions and bootlegs introduced multi-colored hardware (prominently *Space Invaders Part II / Deluxe* in 1979).

---

## 2. Canonical Names for Game Pieces & Characters

### 2.1 The Player
- **Official Name**: **Laser Cannon** (Midway and Taito operating manuals)
- **Common Alternate Names**: **Laser Base**, **Player Base**, **Defense Cannon**, **Player Ship**
- **Function**: Controlled horizontally across the bottom of the screen by the player via two directional buttons or joystick. Fires vertical shots upward with a single FIRE button. Only one player shot may exist on screen at any time.

---

### 2.2 The Invaders (The Alien Formation)
The alien formation consists of **55 invaders** organized in a rectangular matrix of **5 horizontal rows of 11 columns**. Nishikado modeled the aliens after sea creatures, drawing inspiration from H.G. Wells' *The War of the Worlds*.

| Sprite Graphic | Official Character Name | Japanese Name | Grid Row(s) | Score Value | Visual Description |
|:---:|:---|:---|:---:|:---:|:---|
| **Squid** | **Small Invader** / **Squid** | イカ (*Ika*) | Row 0 (Top row, 1 row × 11) | **30 Points** | Compact alien with upward-pointing tentacles and prominent eyes. Highest value regular invader. |
| **Crab** | **Medium Invader** / **Crab** | カニ (*Kani*) | Rows 1 & 2 (Middle, 2 rows × 11) | **20 Points** | Broad alien with distinct pincer-like appendages and animated claw extensions. |
| **Octopus** | **Large Invader** / **Octopus** | タコ (*Tako*) | Rows 3 & 4 (Bottom, 2 rows × 11) | **10 Points** | Wide alien with downward drooping tentacles. Front-line troops closest to the player's bunkers. |

- **Animation**: Each invader alternates between 2 distinct animation frames on every step to produce a walking/pulsing motion.

---

### 2.3 The Mystery Ship
- **Official Names**: **Mystery Ship** (arcade bezel/score table), **Command Ship**, **Flying Saucer**, **UFO**
- **Points**: **50**, **100**, **150**, or **300 points** (Variable bonus)
- **Function**: Flies horizontally across the very top of the playfield (above the alien formation) at periodic intervals (approximately every 20–25 seconds, or triggered by specific player shot counts in the original ROM algorithm). It does not drop bombs and poses no threat, but provides crucial bonus scoring.

---

### 2.4 Defensive Structures
- **Official Names**: **Bunkers** (service manual), **Base Shelters**, **Defense Shelters**, **Shields**
- **Japanese Term**: トーチカ (*Tochika*, meaning "pillbox" or "fortification")
- **Quantity**: Exactly **4 bunkers** evenly spaced between the alien formation and the player cannon.
- **Function**: Stationary shelters that protect the laser cannon from enemy bombs. 
- **Destructibility**:
  - Bunkers erode dynamically on impact from both enemy bombs (chipping away from the top) and player shots (eroding from underneath).
  - When invaders descend sufficiently low, their collision destroys entire sections of any bunker they touch.

---

### 2.5 Projectiles & Bombs

#### Player Projectile
- **Official Name**: **Missile** or **Laser Shot**
- **Behavior**: Fires vertically straight upward at high velocity. Max 1 active shot on screen at a time (creating the game's famous risk-reward pacing).

#### Alien Projectiles
The alien army drops 3 distinct types of bombs (identified in the original Taito assembly code as Object 2, 3, and 4):

1. **Rolling Shot (Targeted Bomb)**:
   - Spiraling missile pattern.
   - Specifically computed to home in and drop directly above the player's current horizontal position.
2. **Plunger Shot (Straight Bomb)**:
   - Straight missile with a distinct plunger/tee shaped head.
   - Cycles through a fixed column schedule to drop on predetermined intervals. Disabled when only one alien remains.
3. **Squiggly Shot (Zig-Zag Bomb)**:
   - Erratic zig-zag / lightning bolt pattern (resembling a resistor schematic symbol).
   - Drops according to a fixed sequence of column offsets.

---

### 2.6 Heads-Up Display (HUD) & Console Terminology

- **1UP**: Player 1 current score header.
- **2UP**: Player 2 current score header (in two-player alternating games).
- **HI-SCORE**: The cabinet's all-time highest score.
- **SCORE ADVANCE TABLE**: The attract mode demonstration listing alien point values:
  - `= ? MYSTERY` (Mystery Ship)
  - `= 30 POINTS` (Squid)
  - `= 20 POINTS` (Crab)
  - `= 10 POINTS` (Octopus)
- **RESERVE CANNONS / LIVES**: Icons of the Laser Cannon displayed at the bottom-left indicating remaining spare lives.
- **CREDIT**: Quarter/coin counter readout displayed at bottom-right.
- **GROUND LINE**: The green horizontal boundary line indicating the planetary surface baseline beneath the cannon.

---

## 3. Core Gameplay Rules & Mechanics

1. **March Cadence & Speed Scaling**:
   - The game processes one alien movement per video frame.
   - When all 55 aliens are alive, the formation moves slowly.
   - As invaders are destroyed, the loop has fewer aliens to process, causing the remaining invaders to speed up proportionally.
   - The iconic four-note bass heartbeat sound (`dum... dum... dum... dum...`) accelerates in lockstep with the speed.
   - The final remaining invader dashes across the screen at maximum speed.

2. **March Direction & Lowering**:
   - The formation moves horizontally until the outermost living alien reaches the screen boundary.
   - When an edge is contacted, the entire formation drops down one row and reverses direction.

3. **Invasion & Game Over Condition**:
   - If any alien reaches the bottom bunker/cannon baseline, the invasion is successful and the game ends immediately, regardless of remaining spare lives.

4. **Wave Progression**:
   - Clearing all 55 invaders completes the wave and advances the player to the next wave.
   - In subsequent waves, the invader formation starts one step lower down the screen (up to wave 9), drastically reducing reaction time.

---

## 4. Visual Color Specifications in this Implementation

| Element | Color Name | Hex Code | Visual Rationale |
|:---|:---|:---:|:---|
| **1UP Header** | Arcade Cyan | `#00E5FF` | Matches the iconic splash screen HUD |
| **HI-SCORE Header** | Arcade Red | `#FF2626` | High-visibility attention color |
| **2UP Header** | Arcade Cyan | `#00E5FF` | Symmetrical with Player 1 HUD |
| **Score Numbers** | Crisp White | `#FFFFFF` | Authentic arcade digital readout |
| **Row 0: Squid (30 pts)** | Arcade Yellow | `#FFE600` | Bright, distinct from green bunkers |
| **Row 1: Upper Crab (20 pts)** | Arcade Cyan | `#00E5FF` | Faithful to splash screen row 2 |
| **Row 2: Lower Crab (20 pts)** | Magenta / Pink | `#FF2AB6` | Faithful to splash screen row 3 |
| **Row 3: Upper Octopus (10 pts)** | Arcade Red | `#FF2626` | Faithful to splash screen row 4 |
| **Row 4: Lower Octopus (10 pts)** | Arcade Red | `#FF2626` | Matches bottom frontline rank |
| **Mystery Ship** | Arcade Red | `#FF2626` | Classic arcade bonus craft color |
| **Laser Cannon** | 80% Gray / Silver | `#CCCCCC` | Clean retro silver/gray, distinct from green bunkers & colored alien rows |
| **Bunkers / Shelters** | Arcade Green | `#00C864` | Authentic arcade cellophane green |
| **Ground Baseline** | Arcade Green | `#00C864` | Planetary surface line |
| **Laser Shots & Bombs** | Pure White | `#FFFFFF` | High-visibility projectiles |

---

## 5. Cosmic Battlegrounds & Environmental Theaters (Levels 1 – 8)

Each wave progression transitions dynamically to an increasingly hostile planetary or deep-space theater with distinct drop dynamics and visual environments:

| Level | Theater Designation | Asset File | Tactical Dynamics & Environment |
|:---:|:---|:---|:---|
| **01** | **Lunar Orbit** | `assets/bg_moon.jpg` | Standard drop altitude, introductory wave pacing. |
| **02** | **Stellar Nebula** | `assets/bg_nebula.jpg` | Rapid-fire alien bomb dropping against vibrant interstellar gas. |
| **03** | **Ringed Colossus** | `assets/bg_ringed_planet.jpg` | +1 Drop row; alien formation begins lower down the screen. |
| **04** | **Supernova Nebula** | `assets/bg_supernova.jpg` | High-velocity targeted salvos amidst glowing emerald and golden cosmic dust pillars. |
| **05** | **Spiral Galaxy** | `assets/bg_galaxy.jpg` | +2 Drop rows; compressed reaction times across the galactic disc. |
| **06** | **Magnetic Pulsar** | `assets/bg_pulsar.jpg` | Heavy targeted bomb salvos timed to alien cadence. |
| **07** | **Solar Eclipse** | `assets/bg_eclipse.jpg` | +3 Drop rows; lethal low-altitude approach. |
| **08** | **Cosmic Singularity (Master Level)** | `assets/bg_singularity.jpg` | Event horizon; maximum alien aggression. True master tier. |

---

## 6. Tactical Pause System
- **Trigger**: Pressing `[TAB]`, `[P]`, or clicking the cabinet arcade guide button during gameplay.
- **Visual State**: Main playfield (`#theCanvas`) receives a Gaussian blur and dimming filter (`filter: blur(8px) brightness(0.55)`), overlaid by a prominent glowing neon HUD banner stating **`PRESS ESC TO CONTINUE`**.
- **Execution State**: Cannon movement, bomb dropping, projectile tracking, and hit detection are frozen in place. March cadence sound and looping UFO sounds halt immediately.
- **Resume**: Pressing `[ESC]`, `[TAB]`, or clicking anywhere on the overlay/backdrop dismisses the drawer, removes the blur, and smoothly resumes gameplay from the exact frame where it stopped.

