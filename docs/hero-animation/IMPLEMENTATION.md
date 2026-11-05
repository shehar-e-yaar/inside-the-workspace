# Hero flow animation — implementation and validation

## Scope

Mounted beneath the existing paragraph in `.about-grid > .about-copy`, the location clarified by the user's screenshot. The original computer introduction, terminal, copy, navigation, and all other sections remain intact. Nothing has been pushed.

Only existing source changed: `src/App.tsx` — one component import and one `<HeroFlowVisual/>` mount. No global CSS, dependencies, project data, backend, or route changes.

## Added files

- `src/HeroFlowVisual.tsx`: isolated scene renderer and animation lifecycle, hover/focus pause, manual pause/resume, visibility suspension, resize handling, background parallax, cleanup.
- `src/HeroFlowVisual.module.css` and its `.d.ts`: component-only styles and typing.
- `src/heroFlowTimeline.ts` and `.test.ts`: phase, playback and parallax rules; loop-continuity tests.
- `src/heroFlowDesign.json`: exact scene structure, styles and motion values converted from Figma's generated context.
- `src/heroFlowSvg.json`: original hidden-state SVG exports inlined for animation.
- `public/hero-flow/`: 147 original local SVG exports, about 87 KB total.
- `docs/hero-animation/context-*.txt`, `motion-context.json`, `asset-manifest.json`, `prepare-visual.mjs`: reproducible reference/conversion resources.
- `desktop-validation.png`, `mobile-validation.png`: browser verification captures.

## Verified design

Figma file `3zLiGlrMVFqsEELo6zw05g`, main visual `71:4712`, mobile frame `71:6137`.

Pipeline order: Kafka → PySpark → Airflow → PostgreSQL → Snowflake. The nine timeline clips, waveform samples, ruler, playhead, original geometric glyphs, connections and background geometry are retained. SVGs use their original intrinsic dimensions, and the containing 640×520 or 390×520 canvas scales uniformly.

## Intentional adaptations / export limitations

- Figma's original scene boundaries were approximately 4/8/10/12 seconds. Its exported motion values and easing are retained, with the time coordinates mapped to the requested 3/6/9/12-second structure.
- The desktop design is scaled into the existing right column rather than replacing the full Figma hero. Existing headline and paragraph are unchanged.
- Mobile uses the verified static topology. Reduced motion uses the desktop static pipeline. Neither runs the looping animation or parallax.
- Pause/resume, name-only tooltips, keyboard/touch interaction and background-only ±4 px parallax implement the requested interactions; they were not Figma prototype states.
- A few SVG exports bake opacity zero into their contents; particle filters also contain infinite bounds. Original SVG files remain unchanged. Their inlined animated groups have opacity delegated to their wrappers and the invalid filters suppressed. No glyphs or paths were redrawn. Consequently, the packets lack the broken exported blur.
- The counter remains readable and updates at most ten times per second during the pipeline scene. Its accessible description and title identify it as illustrative, not live telemetry.
- The interface targets smooth rendering, but no hardware FPS benchmark has been performed.

## Completion checklist

- [x] Right-column integration only; original text and other functionality preserved in the diff.
- [x] Four scenes rendered; transformation and return observed in the browser.
- [x] All exported motion tracks have matching first/last values, sorted keyframes and 12-second duration; infinite looping restored after JSON serialization.
- [x] Desktop node interaction paused at 7.12 seconds and remained at 7.12 on a later check; exiting resumed at 7.70 seconds.
- [x] Manual pause/resume and name tooltip verified.
- [x] Mobile Airflow tap/focus and tooltip verified at 390×844.
- [x] No horizontal document overflow at desktop or mobile; component clips to its own aspect-ratio container.
- [x] Browser console had no errors or warnings during validation.
- [x] Parallax bounded to ±4 px per axis; reduced-motion/static playback gates covered by tests.
- [x] Build passes; 65 tests pass across 9 files.
- [ ] OS/browser reduced-motion preference was not emulated in the available browser tools; static mobile rendering was verified and the reduced-motion code path reviewed.

Build reports a main-chunk-size advisory (>500 KB); no compilation failure. No new dependencies were added.
