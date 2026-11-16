# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Children aged 6–11** (Cubs 6–8, Explorers 9–11), at home (living room, bedroom, flat) or at a local park, usually with a phone or tablet propped up or held by a grown-up. They do a 10–15 minute quest about three times a week.
- **Parents and carers**, who find HypeCubs, run the 2-minute setup (health check, safety promises, child profile), stay nearby for hanging and playground moves, and manage profiles and data behind a grown-up gate.

## Product Purpose
Get primary-age children practising real movement skills (crawling, hanging, jumping, balancing, pushing) little and often, and wanting to come back. Success: a child asks to do their quest, levels creatures up over weeks, and keeps going without being nagged or hooked by manipulative mechanics.

## Positioning
Real progressive skill ladders for kids (six animal creatures, five stages each, levels never go down), delivered "phone down": the app gives the mission, then gets out of the way. Motivation comes from visible mastery, a story the child steers, and effort-based praise, not points shops, streak punishment or leaderboards. Unusual extras: Playground Quests built from the kit at your park, and Teach a Grown-Up, where the child coaches the adult.

## Operating Context
- Kids' app: `app.html` (quests, codex, story, firsts, wiggle, park, teach). Grown-ups area behind a maths gate.
- Parent landing: `index.html`, plus privacy (with a kids' summary), terms and cookie pages.
- Used mid-movement: big targets, glanceable from a distance, read-aloud for younger kids.
- Sister apps from Entwisle Fitness: HypeReps (teens and adults), Barbell Five, StayStrong50.

## Capabilities and Constraints
- Plain static HTML/CSS/JS, no build, no backend. Deployed on Vercel; code on GitHub (iamaosato-sys).
- Data on device only (localStorage). No analytics, cookies or third-party scripts on any child-facing screen (ICO Children's Code). GA4 with Consent Mode + Search Console on parent pages only.
- Free assets only: no paid fonts, images, tools or subscriptions.
- One quest a day; rest days are part of the design.
- Must work offline as a PWA.

## Brand Commitments
- Name: HypeCubs. The Campfire Cub is the guide character. Creatures: Bear, Gorilla, Kangaroo, Crab, Flamingo, Monkey. Stages: Cub, Scout, Ranger, Champion, Legend. Story: The Lost Forest.
- Voice: enthusiastic hype coach that praises effort and brave tries, never talent, weight, size or looks.
- Must not feel: babyish (9–11s embarrassed), school-like (homework or PE worksheet), or a generic AI-app look.
- All artwork original. No copyrighted characters.

## Evidence on Hand
- Research-backed design brief (Claude Docs: "HypeCubs — Kids Version Design Brief").
- No testimonials, user numbers, ratings or endorsements exist. None may be invented.

## Product Principles
1. Movement over screen time: every screen should get the child off the screen faster.
2. Mastery you can see: progress is visible, permanent, and never taken away.
3. Effort is the hero: celebrate trying, not talent.
4. Safe by default: grown-up in the loop, privacy by design, no dark patterns.
5. Grows with the child: respectful enough for an 11-year-old, simple enough for a 6-year-old.

## Accessibility & Inclusion
WCAG 2.2 AA. Large tap targets (kids' motor skills, mid-exercise), read-aloud for pre-readers, reduced-motion support, high contrast readable from a distance, no reliance on colour alone.
