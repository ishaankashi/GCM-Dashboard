// ALL volatility-regime settings live here.
export const REGIMES=[
 {max:15,label:'LOW VOLATILITY',color:'#22c55e'},
 {max:20,label:'NORMAL',color:'#84cc16'},
 {max:25,label:'ELEVATED',color:'#eab308'},
 {max:30,label:'HIGH',color:'#f97316'},
 {max:Infinity,label:'EXTREME',color:'#ef4444'}];
export const GAUGE_MAX=40;
export const regimeFor=(v:number)=>REGIMES.find(r=>v<r.max)!;
