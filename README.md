# Palm Poster Lab — GTA 6 Cover Art Maker

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/berkahmuse/gta6-palm-poster-lab/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/berkahmuse/gta6-palm-poster-lab/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

**Palm Poster Lab** is an original cover-art maker built for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).
Instead of a grid or a single hero photo, your cover is a scrapbook poster:
tilted snapshot cards — white-bordered photo prints with washi-tape corners and
soft shadows — scattered over a hand-painted sunset backdrop with palm
silhouettes and a glowing sun disc. A hand-marker caption with an underline
swoosh, a star sticker, a palm sticker and an editable round badge finish the
poster.

## What it does

- Upload up to 8 of your own photos (read locally in the browser, never sent anywhere)
- Drag each snapshot card to move it; rotate and scale the selected card with sliders; bring it to the front or remove it
- Three layout presets: **Snapshot Stack**, **Postcard Row**, **Billboard Wide**
- Three warm retro grades: **Golden Hour**, **Faded Film**, **Coral Dusk** — applied to the photos, backdrop and film grain
- Editable cover title, hand-written subtitle and badge sticker text
- Live canvas preview; export PNG at **1080×1080**, **1080×1350** or **1920×1080**
- Works fully offline in desktop Chrome — every script, style, font and image is a local file

Four painted sample scenes are included so the editor opens with a poster
already assembled.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Build the hand-in bundle (copies `app/` + `screenshots/` and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

An entry for [make.fun](https://make.fun/) — bounty
[gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).
