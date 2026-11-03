import { describe, expect, it } from 'vitest';
import { advanceDeck, initialDeck } from './deckState';
describe('intentional skill deck progression', () => {
  it('visits every technology once in order, then unfolds only on the final click', () => {
    let state = initialDeck;
    for(let index=0;index<12;index++) {
      expect(state.front).toBe(index); expect(state.mode).toBe('stacked');
      state=advanceDeck(state,'click',12);
      if(index<11){state=advanceDeck(state,'return',12);state=advanceDeck(state,'settled',12);}
    }
    expect(state.mode).toBe('transitioning');
    state=advanceDeck(state,'expanded',12);expect(state.mode).toBe('expanded');
    expect(advanceDeck(state,'click',12)).toBe(state);
  });
  it('ignores rapid repeat clicks and out-of-order animation completion', () => {
    const sending=advanceDeck(initialDeck,'click',12);
    expect(advanceDeck(sending,'click',12)).toBe(sending);
    expect(advanceDeck(sending,'settled',12)).toBe(sending);
    const returning=advanceDeck(sending,'return',12);
    expect(advanceDeck(returning,'click',12)).toBe(returning);
    expect(advanceDeck(returning,'return',12)).toBe(returning);
  });
});
