export const HERO_LOOP_SECONDS = 12;
export type HeroScene = 'editing' | 'transforming' | 'pipeline' | 'returning';
export function heroSceneAt(seconds: number): HeroScene {
  const t = ((seconds % HERO_LOOP_SECONDS) + HERO_LOOP_SECONDS) % HERO_LOOP_SECONDS;
  return t < 3 ? 'editing' : t < 6 ? 'transforming' : t < 9 ? 'pipeline' : 'returning';
}
export function heroCanPlay(state: { manual: boolean; interacting: boolean; visible: boolean; hidden: boolean; static: boolean }) {
  return !state.manual && !state.interacting && state.visible && !state.hidden && !state.static;
}
export function heroParallax(position: number, size: number) {
  return size > 0 ? Math.max(-4, Math.min(4, (position / size - .5) * 8)) : 0;
}
