// Fixed pointer lanes provide stability; activation itself has no waiting period.
export function createHoverIntent(activate: (index: number | null) => void) {
  let current: number | null = null;
  let exit: ReturnType<typeof setTimeout> | undefined;
  function clear() { clearTimeout(exit); exit=undefined; }
  return {
    request(index: number) { clear(); if(current===index)return; current=index; activate(index); },
    leave() {
      if(exit!==undefined||current===null)return;
      exit=setTimeout(()=>{current=null;exit=undefined;activate(null);},90);
    },
    focus(index: number) { clear(); current=index; activate(index); },
    dispose() { clear(); current=null; },
  };
}
