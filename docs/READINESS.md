# Readiness and verification

## Verified in this session

- React + TypeScript implementation created.
- Final production build passed with TypeScript and Vite 7.3.7.
- Four command-registry tests passed with Vitest 5.0.5.
- Dependency installation audit reports zero known vulnerabilities after updating the test runner.
- Local preview HTTP request returned 200.
- All four supplied certificates are present.
- Public GitHub project paths and previous portfolio source inspected.
- GitHub authentication succeeds as `shehar-e-yaar` with network access.
- Editable Figma desktop/mobile frames, five reveal states and five skill-card variants created and rendered for inspection.
- Original certificates placed in desktop/mobile Figma galleries after explicit approval.
- Browser terminal input, history, autocomplete, desktop flip, certificate navigation/Escape close and mobile menu/next-card/flip checks passed.
- No horizontal page overflow at the tested 1440 px desktop and 390 px mobile widths.
- Browser checks found and fixes addressed reveal-opacity lag and focus-induced mobile carousel scrolling.
- Intro caption overlap fixed: floating workspace labels removed and the transition headline moved after the sticky scene. Browser checks at 1440×900, 1366×650 and 390×844 confirmed separate caption flow; the short laptop layout also has clear navigation-to-monitor spacing.

## Outstanding gates

| Requirement | Status |
| --- | --- |
| Original interactive terminal | Implemented; command tests and browser input/history/autocomplete pass |
| Native-scroll computer reveal and reversal | Verified: downward scale .861 / stand opacity .685; upward scroll returned to scale 1 / stand opacity 0 |
| Skill fan, hover, 180-degree flip | Desktop flip and fan inspected in browser |
| Mobile swipe, tap, navigation | Menu, next-card and tap-equivalent flip pass; physical swipe pending |
| Reduced motion and keyboard navigation | Implemented; manual verification pending |
| About, skills, projects, credentials, contact | Implemented |
| Editable Figma desktop/mobile frames | Created and visually inspected |
| GitHub publication | Public repository created with explicit approval; source is versioned on the main branch |
| Amplify public HTTPS hosting | Not deployed; AWS access unavailable |
| Genuine application and AWS screenshots | Pending |
| Builder Center submission | Draft prepared; not posted |

## Manual browser check

1. At 1440×900 and 1366×768, check hero sizing, text readability, navigation and monitor framing.
2. At 768 px and 390 px widths, confirm no horizontal page overflow and no clipped labels. Open/close mobile navigation with keyboard and touch.
3. Run every terminal command. Check invalid input, history, Tab, Ctrl+L, long output scrolling and touch shortcuts. Verify that typing characters never runs a real shell command.
4. Scroll through the full scene and back up. Confirm stand/keyboard reveal, natural transition, working skip intro and no page scroll trap.
5. Hover each desktop card and check neighboring movement. Flip both collections using mouse and Enter/Space. On mobile, swipe left/right and test next/previous buttons, tap flip and tap return.
6. Open each certificate. Check image completeness, Escape close, arrows, Tab containment, focus return, close button and background click. Check long titles on phones.
7. Open all project and contact links. Check mail and LinkedIn destinations. Verify external tabs have noreferrer protection.
8. Enable reduced motion. Confirm a static intro and immediate card flips; no flickering cursor or smooth-scrolling animation.
9. Repeat the important checks against the actual public HTTPS production URL. Check a fresh signed-out browser and phone.
10. Capture real screenshots only after passing the above. Add them to `docs/screenshots/` and reference them from the README and submission.

No Lighthouse score, physical-device swipe pass, complete accessibility audit or AWS deployment is claimed. Figma renders are design evidence, not browser screenshots. Native webpage-to-Figma capture timed out and produced no captured page.
