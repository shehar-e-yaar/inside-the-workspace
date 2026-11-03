export type DeckState = { mode: 'stacked' | 'transitioning' | 'expanded'; front: number; cycle: 'idle' | 'sending' | 'returning' };
export const initialDeck: DeckState = { mode: 'stacked', front: 0, cycle: 'idle' };
export function advanceDeck(state: DeckState, action: 'click' | 'return' | 'settled' | 'expanded', count: number): DeckState {
  if(action === 'click' && state.mode === 'stacked' && state.cycle === 'idle') {
    return state.front === count - 1 ? { ...state, mode: 'transitioning' } : { ...state, cycle: 'sending' };
  }
  if(action === 'return' && state.cycle === 'sending') return { ...state, front: state.front + 1, cycle: 'returning' };
  if(action === 'settled' && state.cycle === 'returning') return { ...state, cycle: 'idle' };
  if(action === 'expanded' && state.mode === 'transitioning') return { ...state, mode: 'expanded' };
  return state;
}
