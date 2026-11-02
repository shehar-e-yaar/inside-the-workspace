# Inside the Workspace — design handoff

## Status

Figma file: https://www.figma.com/design/3zLiGlrMVFqsEELo6zw05g

The editable design is now created and visually inspected. Access was restored after the initial account limit. Library imports still denied permission, so original native components were built using the implemented visual specification. The automatic webpage capture timed out; it was not used as the deliverable. Original certificate images were uploaded after explicit user approval.

| Deliverable | Figma node |
| --- | --- |
| Desktop portfolio, 1440 px | [Desktop](https://www.figma.com/design/3zLiGlrMVFqsEELo6zw05g?node-id=6-900) |
| Mobile portfolio, 390 px | [Mobile](https://www.figma.com/design/3zLiGlrMVFqsEELo6zw05g?node-id=6-1144) |
| Foundations | `5:35` |
| Five skill-card variants | `5:88` |
| Card-state specimens | `6:1801` |
| Tools/cloud collection | `12:150` |
| Five connected reveal states | `6:1388`, `6:1469`, `6:1551`, `6:1633`, `6:1715` |

The canvas includes editable text, Auto Layout, semantic color/spacing/radius variables, text/effect styles, nested technology-logo components, repeated card instances and eight certificate-image placements across desktop/mobile. Click connections link the five reveal frames; front/back card variants have change-to connections. Real native-scroll perspective, spring motion and 180-degree CSS flips live in React.

## Visual identity

A graphite developer workspace lit from opposite sides by muted cyan and lavender. Reflective monitor edges and translucent navigation provide depth. Typography and spacing carry the editorial sections; physical cards are reserved for skills.

| Role | Value |
| --- | --- |
| Canvas | `#080a0e` |
| Surface | `#13171e` |
| Primary text | `#f0f1f3` |
| Secondary text | `#939aa8` |
| Cyan | `#b0eced` |
| Lavender | `#bcb7df` |
| Border | `rgba(219,230,255,.13)` |
| UI font | Space Grotesk, 400 / 500 / 700 |
| Terminal / labels | JetBrains Mono, 400 |
| Desktop canvas | 1440 px |
| Mobile canvas | 390 px |
| Content | max 1200 px with 56 px desktop / 24 px mobile gutters |
| Major spacing | 110 px desktop / 58 px mobile |
| Card radius | 19 px |

## Editable Figma inventory

The single organized canvas contains a foundation specimen with scoped primitive and semantic variables, spacing/radius tokens, shared text styles and glass/shadow effects. Component fills, borders, radii and gaps bind to these variables. Main components and icon construction assets are outside review frames.

The desktop and mobile layouts follow Terminal → About → Skills → Projects → Credentials → Contact. Five separate top-level frames represent the fullscreen terminal, beginning reveal, mid reveal, full computer and portfolio transition. Text and monitor geometry are native editable layers.

The reusable SkillCard component set includes Front, Hover, Selected, Back and Mobile. Twelve technology logo components use editable SVG geometry. Desktop/mobile credential tiles preserve the original certificate artwork using FIT image fills. Eight expanded certificate-viewer frames (four desktop, four mobile) have open-overlay and close/back prototype connections.

## Motion specification

| Interaction | Implementation |
| --- | --- |
| Intro | 280svh sticky scene desktop; 200svh mobile |
| Scroll progress | Native page scroll, Motion `useScroll`, fully reversible |
| Computer scale | 1 → .97 → .58 → .56 at 0 / .12 / .85 / 1 |
| Computer rotateX | 0 → 9 degrees |
| Computer rotateY | 0 → -12 → -8 degrees |
| Stand / keyboard | Opacity 0 → 1 at progress .05 → .45 |
| Transition headline | Separate normal-flow block after the sticky computer scene; never overlays the monitor |
| Desktop fan | Six cards, 142 px offset spacing, 8-degree angle steps |
| Active card | Rise 70 px, scale 1.08, rotation 0 |
| Neighbor response | Shift 28 px away from active card |
| Spring | stiffness 190, damping 22 |
| Flip | rotateY(180deg), .72s cubic-bezier(.2,.8,.2,1) |
| Mobile | 280 px carousel spacing, swipe or arrow buttons, tap to flip |
| Reduced motion | Static intro, immediate flips, no animated scrolling |

## Verification

Figma hero, mobile skills, card variants and certificate gallery were rendered and inspected. Horizontal Auto Layout height clipping, hover-card clipping and icon contrast were corrected. Final design renders are in `docs/screenshots/`.

Browser checks verified the core terminal, cards, certificate modal and mobile navigation. Reveal-opacity and mobile card focus-scrolling bugs were found and fixed. Physical touch-swipe, reduced-motion, tablet and assistive-technology checks remain pending. The project is not yet AWS-deployed.
