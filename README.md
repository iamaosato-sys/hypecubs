# HypeCubs

Free movement quests for kids aged 6–11. Sister app to HypeReps (teens and adults), Barbell Five and StayStrong50.

- `index.html`: parent landing page (GA4 Consent Mode + Search Console live here only)
- `app.html`: children's app. No analytics, no cookies, no third-party scripts (ICO Children's Code)
- `data.js`: creatures, levels, story, hype lines, Body Lab facts, playground moves
- `app.js`: app logic. Progression in `progress()`, path rotation in `paths()`
- Storage: localStorage `hypecubs.v1` (on device only). Consent: `hypecubs.consent`

## Progression
3 creatures per quest, 2 rounds (Cubs 6–8) or 3 rounds (Explorers 9–11).
All rounds done: target +1 rep / +3 s / +2 steps. Top of range: creature evolves (Cub, Scout, Ranger, Champion, Legend).
"Too tricky" twice in a row: practice version. Levels never go down. One quest per day.

## Setup to do
1. Put the GA4 Measurement ID in `window.GA_ID` (index.html + privacy/terms/cookies). The banner only shows once an ID is set.
2. Search Console: put the token in `window.GSC_TOKEN` (or verify by DNS), submit `sitemap.xml`, link to GA4.

Plain HTML/CSS/JS, no build step. Deploys as a static site on Vercel.
