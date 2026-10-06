import type {HistoricalDataPoint} from './types';
export function analytics(h:HistoricalDataPoint[]){
 if(h.length<6) return null; const v=h.map(p=>p.value),last=v.at(-1)!,avg=(a:number[])=>a.reduce((x,y)=>x+y,0)/a.length;
 return{last,avg20:avg(v.slice(-20)),hi:Math.max(...v),lo:Math.min(...v),pct:v.filter(x=>x<=last).length/v.length*100,week:last-v.at(-6)!,expMove:last/Math.sqrt(252)};
}
