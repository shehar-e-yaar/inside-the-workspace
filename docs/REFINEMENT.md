# Portfolio refinement checklist

- [x] Consolidate all 12 unique technologies into Tools & cloud; remove collection tabs.
- [x] Preserve desktop fan, keyboard flip, mobile carousel and tap/swipe handlers.
- [x] Replace Kafka artwork with the official Apache asset, locally served.
- [x] Remove decorative section labels, coordinates, terminal status/version/footer metadata and card numbering.
- [x] Preserve “THERE'S A BUILDER BEHIND EVERY SYSTEM.” and its existing transition typography and placement.
- [x] Keep only one centered, accessible hero scroll arrow, linking to About.
- [x] Replace section header hairlines with scroll-reactive glow bars.
- [x] Add selective ambient side lighting to the hero, skills and credentials.
- [x] Reuse existing Motion, fonts and design tokens; add no dependencies.
- [x] Remove layout-changing project hover padding and obsolete collection styles.
- [x] Production build and all nine tests pass (terminal, hover and stack progression).

## Exact visual and motion limits

| Effect | Limit |
| --- | --- |
| Ambient light | Existing cyan/lavender tokens only; layer opacity 0.08 desktop, 0.04 mobile; gradients fade by 68% (hero) or 32% (section edges) |
| Scope | Hero plus skills and credentials; no ambient animation or animated blur |
| Section light | 2px bar; opacity 0.12–0.48; scaleX 0.12–1; static 16px shadow with 2px spread at 8% alpha |
| Hover | Lift at most 6px; neighboring cards stay fixed; skill scale at most 1.025; retain fan straightening |
| UI timing | Desktop fan hover 250ms with cubic-bezier(.22,1,.36,1); immediate activation, 90ms exit grace; card flip 350ms; mobile spring unchanged |
| Scroll reveal | One shared spring for computer transforms and reveal opacity: stiffness 220, damping 34, mass 0.35 |
| Progress light | Spring stiffness 180, damping 30, mass 0.3; transform/opacity only |
| Scroll indicator | 6px vertical travel; 2.8-second cycle; no accompanying caption or side controls |
| Reduced motion | No continuous animation, ambient lighting, or scroll-reactive glow; instant card changes and static section bars; statement remains visible |

Scroll motion values update styles directly without React state updates. Project and certificate content, URLs, terminal command logic and navigation destinations remain unchanged.

## Reference and validation

Figma reference: existing Workspace SkillCard (`5:53`), About (`6:981`), Skills (`6:990`) and separate transition (`17:229`) in file `3zLiGlrMVFqsEELo6zw05g`. Existing colors, fonts, card corners and shadow language are retained. Figma was inspected as a reference; this change does not overwrite the design file.

Kafka source: https://svn.apache.org/repos/asf/kafka/site/logos/kafka-logo-no-text.png (Apache Software Foundation). Unchanged transparent artwork, displayed in white with a CSS filter for contrast on dark cards. Apache trademarks remain the property of their owners.

Browser checks include desktop (1440px), tablet (820px) and mobile (390px) layouts, all 12 logo loads, terminal command output, keyboard and mobile card flipping, and horizontal overflow. No sustained 60 FPS benchmark has been measured; 60 FPS remains a target requiring profiling on actual devices. No lint command is configured in this repository.

## Interactive stack and hover follow-up

- Initial state is a centered deck. Only its front card is actionable or exposed to assistive technology.
- Cycling order is Python, SQL, Kafka, PySpark, Airflow, dbt, Docker, PostgreSQL, Git, AWS, Azure, C++.
- Each intentional click sends the current card aside for 220ms, then returns it behind the next card for 240ms. The next click is accepted after that 460ms cycle completes.
- A separate View details button preserves access to the existing descriptions before expansion.
- C++ remains centered until clicked. Its click starts the unfold: 600ms movement per card with 18ms stagger, maximum 798ms; interaction unlocks at 850ms.
- Modes are stacked, transitioning and expanded. Rapid repeated clicks are ignored during cycling/unfolding. Scrolling or breakpoint changes do not reset progress. A full page reload starts a new exploration.
- The expanded desktop view is the existing fan. Mobile returns to the existing swipe/arrow carousel to keep cards readable without horizontal page overflow.
- Hover activates immediately with 250ms movement. Pointer selection uses fixed resting-fan coordinates, independent of animated card bounds or stacking order; neighbors stay fixed. Leaving allows a 90ms reentry grace.
- Keyboard Enter/Space uses the native card button. Focus follows the new front card after a keyboard cycle. Mobile taps use the same progression. Reduced motion removes cycle/unfold durations and stagger while retaining intentional progression.
- A reserved action area and unchanged deck height prevent layout shifts during unfolding.

Validation: all 12 cards cycled in order in desktop and mobile browsers; the final card waited for its click; keyboard focus restoration, details, expanded flips and mobile carousel passed. Desktop projects section document position was identical before and after unfolding. Mobile had no horizontal overflow and browser error logs were empty. Automated tests cover full progression, repeated-click protection, hover activation, exit grace and cleanup alongside the terminal registry.
