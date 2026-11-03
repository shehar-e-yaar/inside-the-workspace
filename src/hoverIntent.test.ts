import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHoverIntent } from './hoverIntent';
afterEach(()=>vi.useRealTimers());
describe('responsive stable hover',()=>{
  it('activates immediately and does not repeatedly reset the same card',()=>{
    const activate=vi.fn();const intent=createHoverIntent(activate);
    intent.request(0);intent.request(0);intent.request(1);intent.request(0);
    expect(activate.mock.calls).toEqual([[0],[1],[0]]);intent.dispose();
  });
  it('cancels the short exit grace on reentry',()=>{
    vi.useFakeTimers();const activate=vi.fn();const intent=createHoverIntent(activate);
    intent.request(2);intent.leave();vi.advanceTimersByTime(80);intent.request(2);
    vi.advanceTimersByTime(100);expect(activate.mock.calls).toEqual([[2]]);
    intent.leave();vi.advanceTimersByTime(90);expect(activate.mock.calls).toEqual([[2],[null]]);intent.dispose();
  });
  it('cleans pending work on disposal and supports keyboard focus',()=>{
    vi.useFakeTimers();const activate=vi.fn();const intent=createHoverIntent(activate);
    intent.focus(3);intent.leave();intent.dispose();vi.runAllTimers();
    expect(activate.mock.calls).toEqual([[3]]);
  });
});
