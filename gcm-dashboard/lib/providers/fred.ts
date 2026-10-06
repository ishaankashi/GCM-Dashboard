import type {HistoricalDataPoint,MarketDataProvider,MarketQuote} from '../types';
import {SERIES} from '../config/series';
export class FredError extends Error{constructor(public code:'MISSING_KEY'|'UNAVAILABLE'){super(code)}}
const TTL=60*30; // FRED daily data: cache 30 min server-side
export class FredProvider implements MarketDataProvider{
 name='FRED';
 async getHistory(key:string,start?:string):Promise<HistoricalDataPoint[]>{
  const id=SERIES[key]?.fred; if(!id) return [];
  const k=process.env.FRED_API_KEY; if(!k) throw new FredError('MISSING_KEY');
  const u=`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${k}&file_type=json${start?`&observation_start=${start}`:''}`;
  const r=await fetch(u,{next:{revalidate:TTL}}); if(!r.ok) throw new FredError('UNAVAILABLE');
  const j=await r.json();
  return (j.observations as {date:string;value:string}[]).filter(o=>o.value!=='.'&&o.value!==''&&!isNaN(+o.value)).map(o=>({date:o.date,value:+o.value}));
 }
 async getQuote(key:string):Promise<MarketQuote>{
  const cfg=SERIES[key];
  const base:MarketQuote={symbol:key,name:cfg.name,price:null,change:null,changePercent:null,previousClose:null,weekChange:null,weekChangePercent:null,timestamp:null,source:'FRED',isDelayed:true,frequency:'DAILY'};
  if(!cfg.fred) return {...base,source:'Not connected'};
  const s=new Date(Date.now()-21*864e5).toISOString().slice(0,10);
  const h=await this.getHistory(key,s); if(!h.length) return base;
  const last=h.at(-1)!,prev=h.at(-2),wk=h.length>5?h.at(-6):undefined;
  const d=(a?:HistoricalDataPoint)=>a?last.value-a.value:null,p=(a?:HistoricalDataPoint)=>a&&a.value?(last.value-a.value)/Math.abs(a.value)*100:null;
  return {...base,price:last.value,change:d(prev),changePercent:p(prev),previousClose:prev?.value??null,weekChange:d(wk),weekChangePercent:p(wk),timestamp:last.date,source:key==='VIX'?'FRED / Cboe':'FRED'};
 }
 getMultipleQuotes(keys:string[]){return Promise.all(keys.map(k=>this.getQuote(k)))}
}
