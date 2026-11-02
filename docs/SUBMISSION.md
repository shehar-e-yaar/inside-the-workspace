# Builder Center submission draft

**Draft: update AWS evidence and complete the readiness checks before posting.** Competition dates and rubric are from the user's supplied brief and were not independently verified against an official challenge page.

## Title

Inside the Workspace — a portfolio you can explore

## Story

I'm Muhammad Sheheryar, a BS Computer Science student at UVAS in Lahore, Pakistan. I'm pursuing data engineering by building projects, exploring cloud platforms, and learning how different pieces of a system fit together.

I wanted my portfolio to give visitors something to do. It opens inside a Linux-inspired terminal. You can type `help`, ask `whoami`, browse my projects or see my credentials. The commands run through a fixed browser-local registry, with history and autocomplete. Every section is also accessible through ordinary navigation.

Scrolling pulls the camera away from the terminal and reveals the computer around it. This is a live interaction: native scroll progress controls the scale and perspective of layered CSS geometry. Scrolling upward reverses the movement. Visitors can skip it, and reduced-motion settings provide a simpler introduction.

My toolkit is a deck of collectible cards. Hovering lifts a card and shifts its neighbors; clicking flips it through 180 degrees to explain the skill. On mobile, visitors can swipe between cards or use arrow buttons, then tap for details. The labels distinguish hands-on practice from tools I am still exploring.

The remaining sections are deliberately concise: a personal introduction, repository-linked project names, four original certificates and verified contact links. My research reproductions are labeled as learning work, and my FortyGuard certificate represents completion recognition.

## AWS implementation — finish after deployment

Planned service: AWS Amplify Hosting. The application is a static React/TypeScript build and needs no backend or secrets. The checked-in build configuration installs dependencies, runs terminal tests, builds the Vite output and publishes `dist`.

Before submitting, replace this paragraph with the actual deployment account workflow, successful build evidence, public HTTPS URL and architecture screenshot. **Do not say the portfolio is AWS-hosted until that is verified.**

## Challenges and learning

The central challenge was turning a visual idea into a usable interface. Terminal exploration needed keyboard controls and a safe command boundary. The card deck needed a touch interaction model. The computer reveal needed to respond to native scrolling while preserving an escape route for people who want the content immediately.

I used CSS 3D transforms and Motion rather than introducing a heavier 3D renderer. That keeps the interactions in browser code and makes the hosting architecture straightforward.

After an initial account-access block was resolved, the Figma file was completed with editable desktop/mobile layouts, five reveal states, native skill-card variants, shared tokens and original certificate artwork. The automatic page capture timed out, so the design was constructed directly as editable layers. Browser testing caught and helped fix reveal-opacity lag and mobile card focus scrolling. Real-device touch and reduced-motion checks are still required before submission.

## Evidence to attach

- Actual public Amplify URL and GitHub repository URL.
- Desktop terminal screenshot with a successful command response.
- Computer reveal screenshot at the zoomed-out state.
- Skill deck screenshot with a flipped card.
- Mobile screenshot showing readable layout and navigation.
- Original credential gallery screenshot.
- Authentic Amplify successful build and hosting settings screenshots.
- Deployed architecture graphic.

## 120-second demo

| Time | Action |
| --- | --- |
| 0–15s | Open the public URL. Type `help`, then `whoami`; show history. |
| 15–35s | Scroll away from the terminal to reveal the computer; reverse briefly. |
| 35–60s | Hover a skill, flip it, switch collections. Point out learning labels. |
| 60–80s | Show concise project links. Enlarge a credential and close with Escape. |
| 80–100s | Show mobile navigation, swipe a card, tap to flip. |
| 100–120s | Show the real Amplify deployment evidence and closing contact section. |
