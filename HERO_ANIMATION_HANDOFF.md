# Hero animation handoff

Analysis only — 2026-11-05. Existing portfolio changes were pushed first to main, commit 128995b. No existing source, styling, dependencies or Figma layers changed during this analysis.

## 1. Verified design

[Hero layout for new design](https://www.figma.com/design/3zLiGlrMVFqsEELo6zw05g?node-id=68-6503), group 68:6503, 3000 × 4220, page Inside the Workspace (0:1). Found by exact group-name search in the repository-linked file. Current Figma selection was empty. Headline verified as “From editing\nframes to building\ndata flows.” No replacement design invented.

Main desktop: Combined hero (71:4703); right visual Motion region (71:4712), x744 y190, 640 × 520 within 1440 × 900. Main mobile: Combined hero / Mobile static pipeline (71:6137), 390 × 520. Reduced motion: 71:5752. Timeline-only desktop alternative: 71:3320. Other dashboard frames are supplementary references, not instructions to add more features.

## 2. Full frame inventory

Original child order retained below (animated count means layers with manual keyframe tracks).

| Order | Exact frame name | Node | Size | Animated layers |
|---|---|---|---|---|
| 1 | Timeline-to-pipeline hero | 71:3320 | 1440 × 900 | 54 |
| 2 | Timeline-to-pipeline / Scene 3 fallback | 71:3686 | 640 × 520 | 0 |
| 3 | Dots-to-grid background | 71:3718 | 640 × 520 | 134 |
| 4 | Orders streaming pipeline | 71:4404 | 640 × 520 | 14 |
| 5 | Self-cleaning data table | 71:4445 | 640 × 520 | 53 |
| 6 | Task orchestration DAG | 71:4596 | 640 × 520 | 29 |
| 7 | Glassy streaming terminal | 71:4669 | 640 × 520 | 25 |
| 8 | Combined hero | 71:4703 | 1440 × 900 | 188 |
| 9 | Combined hero / Scene 3 reduced motion | 71:5752 | 1440 × 900 | 0 |
| 10 | Combined hero / Mobile static pipeline | 71:6137 | 390 × 520 | 0 |

The first, eighth and ninth frames are desktop compositions; the last is mobile. Scene 3 fallback is a static visual. Dots-to-grid is the background animation. Orders, data table, DAG and streaming terminal are separate dashboard/animation studies.

**Exact full hierarchy:** docs/hero-animation/figma-inventory.json records every descendant, original child order, parent nesting, node IDs, local x/y/width/height, text and style index. Its styles array records fills including gradient stops/transforms, border colors/weights, shadows, corner radii, typography, spacing, padding, constraints, layout modes and reactions. Use this authoritative appendix rather than guessing from frame titles. Coordinates of top-level children are Figma canvas coordinates; nested coordinates are local.

Pipeline order verified geometrically left-to-right: **Kafka → PySpark → Airflow → PostgreSQL → Snowflake**. Combined hero node IDs respectively: 71:5724, 71:5727, 71:5730, 71:5733, 71:5736. Local boxes: (32,240,96,96), (152,207,96,96), (272,184,96,96), (392,207,96,96), (512,240,96,96). Do not substitute AWS or the Orders study's different sequence.

Timeline: 71:5396. Clips 1–9: 71:5435, 71:5460, 71:5493, 71:5519, 71:5557, 71:5581, 71:5617, 71:5635, 71:5681. Three rows at y204/258/312, all 36px high. Widths respectively 112/146/116, 165/108/157, 85/197/148; x positions 94/216/372, 94/270/389, 94/190/398. Playhead 71:5715 at (94,175), 8 × 190. Preserve actual waveform/thumbnail descendants and original connector geometry from Figma.

Mobile node positions follow a serpentine route: Kafka (43,82), PySpark (217,82), Airflow (217,222), PostgreSQL (43,222), Snowflake (43,362); each 130 × 86. Connections vector 71:6139. This is a static reference, not a miniature desktop loop.

## 3. Tokens, assets and existing states

Observed typography: JetBrains Mono Regular, 9px; JetBrains Mono Regular, 11px; Space Grotesk Regular, 10px; JetBrains Mono Regular, 8px; JetBrains Mono Regular, 10px; Space Grotesk Regular, 13px; Space Grotesk Regular, 17px; Space Grotesk Medium, 68px; Space Grotesk Regular, 12px; JetBrains Mono Regular, 7px; JetBrains Mono Regular, 20px; Space Grotesk Regular, 11px.

Observed solid colors: #0a0b0f, #7b8196, #ffffff, #4fd1ff, #11131a, #f5f6f8, #71b99a, #d17e86. Exact opacity, gradients and shadows are indexed in the inventory. Example pipeline tile: radius16, background #11131a, 1px white border at ~7.84% opacity, black shadow y12 blur28 at ~25.1%; cyan accent #4fd1ff. Do not globally replace the website palette.

There are **no component instances, components or variant sets** inside these ten frames. States are authored as ordinary layers with manual tracks, not reusable component variants. All report timeline duration12s. Timeline/pipeline opacity, clip translation/scale/opacity and playhead translation/opacity tracks exist. Combined hero adds animated dots/grid (188 animated layers total); fallback/mobile have zero manual tracks. See motion-inventory.json for per-frame counts and property names. Full numeric keyframe/easing data was too large for one connector response and is not exported here; next agent should request motion context only for the specific active layers, not the entire group.

Exported SVG resources in docs/hero-animation/: motion-region.svg (71:3329, composed reference) and vector-01.svg through vector-11.svg (individual vectors extracted by Figma). The tool does not return semantic node IDs for those eleven assets: inspect their shapes before mapping; filenames do not imply technology identity. No source raster images were reported. Keep exports as resources; recreate text, timeline tracks, clips, playhead, nodes and connections as independently addressable code elements for animation. Do not animate a flattened whole-scene SVG.

## 4. Existing project architecture and integration boundary

React19 + TypeScript5.9, Vite, motion/react12, lucide-react; self-hosted Space Grotesk and JetBrains Mono. No GSAP or Three.js dependency. Commands: npm run dev, npm run build (tsc -b + vite build), npm test (Vitest), npm run preview. No lint script. Immediately preceding change passed build and61 tests.

Current hero is **Intro() in src/App.tsx:57**, with Terminal() at line15. Intro renders #home → .intro-sticky → .perspective-stage → motion.div.computer → .monitor / Terminal / stand / keyboard. useScroll + useSpring + useTransform drive the computer reveal. CSS lives in src/style.css: .intro-scene, .intro-sticky, .perspective-stage, .computer and terminal classes; responsive rules include 1600px,1100px,700px and short desktop viewport overrides, plus reduced-motion rules.

**No right-side hero visual currently exists.** The current hero is a centered computer; the About section at App.tsx:116 has .about-grid with text in .about-copy on the right. Neither is the Figma split hero. Do not silently replace the computer, About copy, headline, nav or section layout to manufacture the missing slot. The exact mount point requires user clarification before implementation.

Keep Terminal commands/Forge bridge, header/nav, intro reveal, About copy, ForgeWorkspace and its inventory/book/pipeline viewer, certification gallery, contact, source links, APIs and hosting untouched.

## 5. Proposed files — no implementation performed

Create src/HeroFlowVisual.tsx (isolated640×520 scene), src/heroFlowTimeline.ts (12s phase mapping), src/heroFlowVisual.css (strictly scoped styles), src/heroFlowTimeline.test.ts (pause/phase/reduced-motion behavior), and public/hero-flow/ only for approved SVG assets. A single mount/import in src/App.tsx is conditional on clarifying the missing right-side slot. Do not modify src/style.css globally, src/data.ts, src/terminal.ts or Project Forge files. Existing headline strings remain unchanged.

Component proposal: HeroFlowVisual → AmbientGrid, EditingTimeline (TimelineTrack/TimelineClip/Playhead), PipelineScene (PipelineNode/Connections/DataPackets), MotionControls. These are proposed code boundaries, not invented Figma components.

## 6. Twelve-second interaction plan

- 0–3s: show the verified nine clips on three tracks; move the playhead and retain ruler labels. Keep motion within the fixed scene bounds.
- 3–6s: transform clip positions/scales toward the five verified node positions; fade secondary clips and waveform detail, reveal connections and technology labels. Determine exact clip-to-node correspondence from targeted keyframe reads before coding; no invented mapping.
- 6–9s: activate Kafka → PySpark → Airflow → PostgreSQL → Snowflake; move a few packets along the existing paths. Treat sample “events/sec12,480” as illustrative design text, not live telemetry.
- 9–12s: reverse the same mappings and restore exact timeline start positions/opacity at12s for a seamless loop.

Use one shared Motion timeline/motion value; transforms and opacity, not per-frame React state or animated layout. Prefer existing Figma easing after targeted reads. Proposed fallback easing cubic-bezier(.22,1,.36,1) is an implementation suggestion, not a verified Figma token.

Hover/focus: highlight only the hovered node with a small scale/glow; use its existing name, no invented technical tooltip. Pause/resume: explicit accessible button, preserve phase on pause, suspend when offscreen or document hidden, never override a manual pause on re-entry. Background parallax: proposal capped at4px, fine-pointer only, one frame-scheduled update, disabled on touch/reduced motion. These interactions are requested behavior, not verified Figma prototype reactions.

Responsive: maintain desktop640:520 aspect ratio inside the approved slot; use the verified390×520 static mobile topology when space is limited. Reduced motion: render Scene3 pipeline with no looping, packets, parallax or morph. Keyboard focus and hover information remain available. Do not force a12-second animation on users requesting reduced motion.

## 7. Limitations and next-agent gates

1. Resolve the missing right-side mount point; no source integration is authorized by this analysis task.
2. Confirm Combined hero is the preferred desktop composition over Timeline-to-pipeline hero (recommended because it includes the requested background).
3. Retrieve numeric keyframes only for the selected scene's tracks; full-group motion exceeds connector response limits.
4. Exported generic vector filenames need visual mapping; no fabricated brand mapping is provided.
5. Screenshot/live browser implementation checks are intentionally deferred because this task changes no website behavior. Do not install dependencies or implement before the next task.

Only this report and new handoff resources were written after the push. Stop here.

