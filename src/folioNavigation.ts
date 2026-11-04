export function turnDestination(index:number,side:-1|1,count:number):number|null {
 const next=index+side;
 return next>=-1&&next<count?next:null; // -1 is the cover.
}
export function pageDragProgress(startX:number,currentX:number,width:number,side:-1|1){
 return Math.max(0,Math.min(1,(startX-currentX)*side/Math.max(1,width)));
}
export function commitsPageTurn(progress:number,distance:number){
 return distance<8||progress>=.18;
}
