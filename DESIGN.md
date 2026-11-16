---
name: HypeCubs
description: Movement quests for children 6–11, walked as a waymarked trail through a map of The Lost Forest.
colors:
  moss-ground: "#9fcd73"
  map-field: "#94c463"
  forest-ink: "#12301d"
  forest-ink-soft: "#1f4329"
  legend-sheet: "#f3faea"
  trail-orange: "#ff7a1a"
  trail-orange-deep: "#e2590a"
  sign-yellow: "#ffd23f"
  sign-cream: "#fff4c7"
  timber: "#7a4b2a"
  timber-dark: "#5a3519"
  timber-light: "#9a6339"
  cub-orange: "#ff8a3d"
  answer-go: "#1f8a4c"
  answer-some: "#2459c9"
  answer-tricky: "#c8366f"
  alert-wine: "#9c1c44"
  alert-blush: "#ffe4ee"
  zone-bear-woods: "#2c7a4a"
  zone-monkey-canopy: "#1f9e7a"
  zone-kangaroo-meadow: "#e9b23a"
  zone-crab-shore: "#3fa7d6"
  zone-flamingo-lake: "#ff8fb8"
  zone-gorilla-ridge: "#7d7aa3"
typography:
  display-hero:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 0.98
  display:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "clamp(2rem, 7vw, 2.7rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
  sign:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  counter:
    fontFamily: "Lilita One, Arial Rounded MT Bold, system-ui, sans-serif"
    fontSize: "7rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "Lexend, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Lexend, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  plank: "10px"
  field: "12px"
  sheet: "16px"
  board: "18px"
  map: "22px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  column-app: "640px"
  column-doc: "720px"
  column-landing: "1080px"
components:
  sign-primary:
    backgroundColor: "{colors.trail-orange}"
    textColor: "#2a1100"
    typography: "{typography.sign}"
    padding: "12px 46px 12px 22px"
    height: "66px"
    width: "100%"
  sign-toast:
    backgroundColor: "{colors.sign-yellow}"
    textColor: "#2a1100"
    padding: "14px 44px 14px 20px"
  fingerpost-arm:
    backgroundColor: "{colors.timber}"
    textColor: "{colors.sign-yellow}"
    padding: "10px 40px 10px 16px"
    height: "64px"
  plank:
    backgroundColor: "{colors.timber}"
    textColor: "{colors.sign-yellow}"
    rounded: "{rounded.plank}"
    padding: "10px 20px"
    height: "50px"
  plank-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.plank}"
    padding: "10px 20px"
    height: "50px"
  plank-danger:
    backgroundColor: "{colors.alert-wine}"
    textColor: "#ffffff"
    rounded: "{rounded.plank}"
  nav-item:
    backgroundColor: "rgba(0,0,0,.18)"
    textColor: "{colors.sign-cream}"
    rounded: "{rounded.plank}"
    padding: "8px 14px"
    height: "46px"
  nav-item-current:
    backgroundColor: "{colors.sign-yellow}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.plank}"
  chip:
    backgroundColor: "{colors.legend-sheet}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
    height: "46px"
  chip-on:
    backgroundColor: "{colors.trail-orange}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.pill}"
  legend-sheet:
    backgroundColor: "{colors.legend-sheet}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.sheet}"
    padding: "18px"
  trail-post:
    backgroundColor: "{colors.timber}"
    textColor: "#fff8e3"
    rounded: "{rounded.board}"
    padding: "70px 20px 22px"
  target-plate:
    backgroundColor: "{colors.sign-yellow}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.field}"
    padding: "10px 18px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "52px"
---

# Design System: HypeCubs

## Overview

**Creative North Star: "The Waymarked Trail"**

Every screen is a stretch of trail through a hand-drawn forest map. The ground is moss green carrying topographic contour lines; wayfinding is built from the things you find on a real waymarked walk: an orange dashed trail, circular waymarker discs, routed timber posts, and arrow-ended plank signs with yellow routed lettering. Reading matter sits on pale map-legend sheets edged in forest ink. Nothing floats on a gradient and nothing is a generic rounded card; every container is either a piece of timber, a legend sheet, or the map itself.

The density is low and the targets are large, because the app is read from a distance by a child who is mid-movement. Type does the shouting (Lilita One, set like routed sign lettering) while Lexend carries the reading. Colour has a job: orange means "go this way", yellow lettering means "this is a sign", each creature lives in its own zone colour, and forest ink holds every edge. The world is the same on the parent landing page; there the map is the hero and the trailhead sign is the primary action.

Motion belongs to the trail: the path draws itself, posts pop up from their base, the campfire flickers, and the "you are here" marker breathes. All of it stops under reduced motion, where the trail renders fully drawn.

**Key Characteristics:**
- Moss map ground with irregular contour lines, never a flat or gradient background.
- Timber (wood grain plus a routed lip) for every wayfinding control; legend sheets for every block of reading.
- Arrow-ended signs point the way forward; back signs point left.
- Six fixed creature zone colours, used for zones, discs and nothing else.
- Original, code-authored SVG only: discs, map, Cub, icons, faces.
- Big targets (46px minimum, 64–104px for primary trail controls).

## Colors

A grounded outdoor palette: moss, timber and ink carry the structure, one hot orange marks the route, sign yellow marks lettering, and six zone colours give each creature its place on the map.

### Primary
- **Trail Orange** (trail-orange): the route. The dashed trail line, the primary START TRAIL / I did it! sign, the current trail marker and its breathing halo, the focus ring, selected chips, text selection, and link underlines. If something is orange, it is the way forward.
- **Trail Orange Deep** (trail-orange-deep): the darker route tone for small marks that need weight on pale sheets: earned stage stars, checkbox accent, caret, codex chevrons.

### Secondary
- **Sign Yellow** (sign-yellow): routed lettering. Text on timber (planks, fingerpost arms, the brand, post titles), the current nav plank, the target plate on a trail post, the hype toast, the trailhead CTA on the hero map, and the Legend crown.
- **Sign Cream** (sign-cream): quieter lettering on timber: nav items, tool buttons, secondary lines on posts and boards.

### Tertiary
- **Creature zone colours**: Bear Woods (zone-bear-woods), Monkey Canopy (zone-monkey-canopy), Kangaroo Meadow (zone-kangaroo-meadow), Crab Shore (zone-crab-shore), Flamingo Lake (zone-flamingo-lake), Gorilla Ridge (zone-gorilla-ridge). Each fills its zone shape on the map and the face of its creature's waymarker disc. The values live in `data.js` ZONES and are mirrored as CSS custom properties.
- **Answer colours**: Go Green (answer-go), Some Blue (answer-some), Tricky Pink (answer-tricky) for the three self-report answer signs, always paired with a word label. Go Green also marks completed trail markers and earned route stops.
- **Cub Orange** (cub-orange): the Campfire Cub's fur, and only the Cub.

### Neutral
- **Moss Ground** (moss-ground): the page. Always under the contour-line SVG pattern.
- **Map Field** (map-field): the ground inside the framed forest map.
- **Forest Ink** (forest-ink): text, every border (sheets, map frame, discs, inputs, chips, markers), and the outline on all drawn art.
- **Forest Ink Soft** (forest-ink-soft): secondary text, sub-lines, captions, locked route stops.
- **Legend Sheet** (legend-sheet): the pale map-legend surface for reading panels, modals, the consent banner, chips and empty markers.
- **Timber / Timber Dark / Timber Light** (timber, timber-dark, timber-light): signposts, planks, the header bar, trail posts, boards. Dark is the routed lip and the header's bottom edge; Light is the lit face of a board's gradient.
- **Alert Wine / Alert Blush** (alert-wine, alert-blush): warning sheets and the danger plank in the grown-ups area.

### Named Rules
**The Orange Means Go Rule.** Trail Orange is reserved for the route and the next action. A decorative orange fill elsewhere dilutes the one signal a child follows.

**The Zone Belongs to the Creature Rule.** Zone colours appear only on a creature's zone and disc. They never become general UI accents, and a creature never appears on another creature's colour.

**The Never Colour Alone Rule.** Every colour-coded meaning also carries a word, a shape or a position: answer signs have labels, stars have an aria label, markers have a "Post 1 of 3 · round 1 of 2" caption.

## Typography

**Display Font:** Lilita One (fallback Arial Rounded MT Bold, system-ui)
**Body Font:** Lexend (variable 100–900; fallback system-ui, -apple-system, Segoe UI)

Both are OFL and self-hosted from `fonts/` with `font-display: swap`; licence files ship alongside.

**Character:** Lilita One is chunky routed-sign lettering: friendly, legible across a room, and grown-up enough not to embarrass an 11-year-old. Lexend is a wide, open reading face chosen for early readers.

### Hierarchy
- **Display Hero** (400, clamp(2.4rem, 6.4vw, 4.4rem), 0.98): the parent landing headline only.
- **Display** (400, clamp(2rem, 7vw, 2.7rem), 1.02): the screen title, "Hi Rocket!", and the move name on a trail post (in Sign Yellow with a timber-dark text shadow there).
- **Headline** (400, 1.7rem, 1.1): section headings.
- **Title** (400, 1.25rem): sub-section headings; codex and route entry names run 1.18–1.35rem.
- **Sign** (400, 1.65rem, 1, 0.02em): primary arrow-sign labels. Planks and fingerpost arms step down to 1.15–1.18rem; nav to 1.02rem.
- **Counter** (400, 7rem, tabular numerals): the countdown timer on a post, in Sign Yellow.
- **Body** (400, 17px, 1.55, max 65ch): all reading text. Post cues at 1.12rem, max 40ch.
- **Label** (600, 0.78–0.95rem): Lexend semibold for sub-lines, captions, status rows, marker captions and small lines under sign text.

### Named Rules
**The Lettering Is Routed Rule.** Display text is always Lilita One at weight 400 in sentence or title case with a slight positive tracking (0.005–0.02em). No uppercase transforms, no faux bold.

**The Two Voices Rule.** Lilita One labels and names things; Lexend explains them. A paragraph is never set in Lilita One.

## Layout

The app is a single centred column (column-app, 640px) with 16px gutters; legal pages use column-doc (720px); the parent landing uses column-landing (1080px). The header is a sticky timber bar spanning the full width.

The app home stacks the framed forest map (roughly two thirds of a phone viewport), the START TRAIL sign directly under it, a centred status line, and then the fingerpost menu. At 1024px and up, the home splits into two columns: map and START TRAIL on the left (map capped at 58vh), fingerpost on the right. The landing hero orders title, map, CTA, copy on phones and becomes a two-column grid (title / copy / CTA beside the map) at 860px, where the three-step "How a trail works" row and the safety promises also become three columns.

Rhythm comes from a small set of observed gaps: 6, 10, 14, 18 and 22px, with sheets separated by 16px and posts given 34px (64px when a marker row sits above, to clear the creature crest). During a trail (mission, rest, report) the footer is hidden so nothing pulls the child away mid-workout.

## Elevation & Depth

Depth is physical and low: objects sit on the map, they do not hover in space. Legend sheets, the framed map, trail posts and boards carry soft, downward ambient shadows tinted with forest ink or timber brown; timber controls carry a routed lip, an inset dark edge along their bottom, which is the board's own thickness rather than a shadow. Pressing a plank compresses the lip; pressing a sign moves it down and right toward its shadow.

### Shadow Vocabulary
- **Sheet rest** (`box-shadow: 0 10px 22px -8px rgba(18,48,29,.35)`): legend sheets.
- **Map frame** (`box-shadow: 0 14px 30px -10px rgba(18,48,29,.45)`): the framed forest map.
- **Board** (`box-shadow: 0 16px 30px -12px rgba(40,22,8,.6)`): trail posts and wood boards on the landing page.
- **Header plank** (`box-shadow: 0 6px 14px rgba(40,22,8,.25)`): the sticky timber header.
- **Routed lip** (`box-shadow: inset 0 -4px 0 var(--wood-dark)`): every plank; pressed state `inset 0 -2px 0`. The target plate uses `inset 0 -4px 0 rgba(0,0,0,.15)`.
- **Modal** (`box-shadow: 0 20px 40px rgba(0,0,0,.35)`) over a forest-ink scrim (`rgba(12,32,19,.72)`).
- **You are here** (`box-shadow: 0 0 0 6px rgba(255,122,26,.3)`, breathing to 11px): the current trail marker only.

### Named Rules
**The Lying Flat Rule.** Shadows always fall downward and stay soft and short. Nothing glows, and no surface floats higher than a modal.

## Shapes

Two silhouettes define the world. The **arrow plank**: a rectangle with a 30px pointed end (26px on fingerpost arms and the toast, 34px on fork signs, 18px on the hero trailhead CTA), pointing right for forward and left for back; left-pointing fingerpost arms alternate with right-pointing ones up the post. The **waymarker disc**: a zone-coloured circle with a forest-ink outline and an inner ring that thickens and warms as the creature evolves (cream, yellow, amber, orange, with a crown at Legend).

Everything else uses gently rounded rectangles: 10px for planks, nav and tools; 12px for inputs and the target plate; 16px for legend sheets and fieldsets; 18px for posts, modals and boards; 22px for the map frame. Chips are full pills. Borders are a confident 3px forest ink (4px on the map frame and modal). Dividers inside sheets are 2px dashed forest ink at 25% opacity, a trail-dash echo; the footer rule is 3px dashed. Stage stars are five-point star polygons. Confetti is diamonds and leaf shapes.

### Named Rules
**The Point the Way Rule.** Only controls that move the child somewhere take the arrow silhouette. A setting, a toggle or a reading panel is never an arrow.

## Components

### Buttons
Tactile timber and painted signs; every control looks like it was cut and routed.
- **Arrow sign (primary):** full-width, 66px tall, Trail Orange with dark brown lettering in the sign style, right-pointing arrow end, trailing arrow icon. Hover slides it 4px forward; active presses it 2px right and 3px down. The back variant points left. Answer signs reuse the shape with Go / Some / Tricky fills and white lettering.
- **Plank:** timber with wood grain, Sign Yellow lettering at 1.15rem, 10px radius, 50px tall, routed lip. Hover lightens to Timber Light; active drops 2px and compresses the lip. **Ghost plank:** transparent with a 3px forest-ink inset ring, for secondary actions on sheets. **Danger plank:** Alert Wine with white text, grown-ups area only.
- **Link button:** Lexend 600 text with a 3px Trail Orange underline offset 5px, 46px tall.
- **Tool:** small translucent dark buttons with a 2px cream border on timber (Read it to me, Brave Try); on sheets they switch to ink text with an ink border.
- **Focus:** a 4px Trail Orange outline at a 3px offset on everything.

### Chips
- **Style:** Legend Sheet fill, 3px forest-ink border, full pill, Lilita One 1.05rem, 46px tall. Used for choosing a profile.
- **State:** the selected chip fills Trail Orange.

### Cards / Containers
- **Legend sheet:** Legend Sheet fill, 3px forest-ink border, 16px radius, 18px padding, sheet-rest shadow. The alert variant is Alert Blush with an Alert Wine border.
- **Trail post (mission screen):** a vertical timber board (horizontal grain gradient from dark edges to a lit centre), 18px radius, 70px top padding under a creature disc crest that overlaps the top edge by 46px. Holds the move name, a cream cue, the Sign Yellow target plate, the primary sign and a tool row.
- **Wood board:** the landing page's timber panel for the "why" and closing CTA sections, cream text, Sign Yellow heading.
- **Tally:** three small timber tiles with a large Sign Yellow numeral over a cream label.

### Inputs / Fields
- **Style:** white field, 3px forest-ink border, 12px radius, 52px tall, Lexend 500 at 1.05rem; placeholder in a muted green-grey. Labels are Lexend 700 above. Fieldsets share the 3px ink border at 14px radius with a Lilita One legend.
- **Checkboxes / radios:** 26px with a Trail Orange Deep accent.
- **Focus:** the global orange focus ring.

### Navigation
- **Header:** a sticky timber bar with grain, a 4px Timber Dark bottom edge, the brand in Sign Yellow Lilita One with a disc-framed Cub mark. Nav items are translucent dark planks with cream Lilita One labels, 46px tall; the current page fills Sign Yellow with ink text.
- **Fingerpost (app home menu):** a central timber post with a grass shadow at its foot and timber arms alternating right and left, each 64px tall with a drawn icon and Sign Yellow label; hover nudges an arm outward with a 1° tilt.
- **Fork signs:** two 104px arrow signs, one pointing each way, showing the three creature discs each path visits.

### Forest Map (signature)
The framed SVG map: six irregular zone shapes in their zone colours, each with a creature disc and a white ink-bordered name tag; nested hand-drawn contour lines drawn once per map (never tiled); a campfire at the centre; numbered timber posts; the Cub at the trailhead with a small timber TRAILHEAD tag. The trail is a 6px Trail Orange line dashed 10/9 over a casing that draws itself in 1.6s, then the dashes fade in. Zones that have been visited brighten.

### Trail Marker Row (signature)
Rounds shown as one unbroken dashed orange line with circular markers: Legend Sheet when ahead, Go Green when done, and a larger Trail Orange "you are here" marker with a breathing halo. A Lexend caption below always states the position in words.

### Waymarker Disc (signature)
Creature art on a zone-coloured disc with an ink outline and an evolving ring (see Shapes). Rendered at 96px on posts and the codex, smaller on the map and forks. Paired with five stage stars.

### Hidden Cub
A 44px Cub head hidden somewhere on a screen, slightly transparent, scaling up on hover; finds are counted in the trail log.

### Hype Toast
A Sign Yellow arrow sign that rises from the bottom of the screen with effort-based praise, then retreats.

### Icons
Drawn SVG on a 24px grid, single 2.5px stroke, round caps and joins, `currentColor`, hidden from assistive tech. No icon fonts, no emoji.

## Do's and Don'ts

### Do:
- **Do** put every screen on the moss ground with contour lines, and frame the forest map with a 4px forest-ink border at 22px radius.
- **Do** use the arrow sign for the one forward action on a screen, in Trail Orange, full width, at least 66px tall.
- **Do** set wayfinding labels in Lilita One Sign Yellow on timber, and reading text in Lexend on a legend sheet.
- **Do** keep every tap target at 46px or more, and primary trail controls at 64px or more.
- **Do** give every colour-coded state a word or shape as well (answer labels, star aria labels, marker captions).
- **Do** draw any new art as original SVG in code, outlined in forest ink, in the same flat-fill style as the discs and the Cub.
- **Do** stop all trail motion under `prefers-reduced-motion` and show the end state (trail drawn, dashes visible, no confetti).

### Don't:
- **Don't** build screens from rounded cards on a gradient; containers are timber, legend sheets or the map.
- **Don't** use a zone colour for anything except its own creature's zone and disc.
- **Don't** use Trail Orange as decoration; it is the route and the next action.
- **Don't** add emoji or icon-font icons; icons are the drawn 2.5px-stroke set.
- **Don't** add stock or AI-generated raster images; every shipping image is SVG authored in `app.js` (exported to `img/*.svg`).
- **Don't** set display text in uppercase or in a system face; Lilita One at 400 only.
- **Don't** show points shops, streak counters, leaderboards or anything that can go down; visible progress only grows.

## Materials and Provenance

These world materials are intentional and recorded as ignores in `.impeccable/config.json`:
- **Wood grain** (`--grain`, a repeating linear gradient) on every timber surface, and the **dashed trail markers** (repeating gradients on the marker row and codex route line). These are the Waymarked Trail world's own materials.
- **Five-point star polygon** for stage stars: geometry, not an organic clip-path.
- **Routed plank lip** (inset bottom edge on planks): the timber's thickness, not a side accent.

All shipping imagery is original SVG authored in code: creature discs, Cub, faces and map come from `art()`, `cubHead()` and the map functions in `app.js`, and `img/*.svg` (six creatures, Cub, legend, hero map) are exports of the same functions. There are no raster images, stock assets or generated rasters. Fonts are Lilita One and Lexend under the SIL Open Font License, self-hosted.
