'use client';
import {useEffect,useMemo,useState} from 'react';
import {Area,AreaChart,CartesianGrid,Line,LineChart,ReferenceLine,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {SERIES,TICKER,type Group} from '@/lib/config/series';
import {REGIMES,GAUGE_MAX,regimeFor} from '@/lib/config/thresholds';
import {analytics} from '@/lib/analytics';
import type {HistoricalDataPoint as P,MarketQuote as Q,FuturesPoint} from '@/lib/types';

const NAV=['MARKET OVERVIEW','VOLATILITY','RATES','FX','COMMODITIES','CREDIT','MARKET NEWS'];
const RANGES=['1D','5D','1M','3M','6M','YTD','1Y','5Y','MAX'];
const f=(v:number|null|undefined,d=2)=>v==null?'N/A':v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const sg=(v:number|null|undefined,d=2,s='')=>v==null?'N/A':`${v>0?'+':''}${f(v,d)}${s}`;
const col=(v:number|null|undefined)=>v==null||v===0?'text-slate-400':v>0?'text-up':'text-down';

function useJson<T>(url:string,ms=0){const[d,setD]=useState<T|null>(null),[e,setE]=useState<string|null>(null);
 useEffect(()=>{let on=true;const go=()=>fetch(url).then(r=>r.json()).then(j=>{if(on){setD(j);setE(j.error??null)}}).catch(()=>on&&setE('UNAVAILABLE'));go();const t=ms?setInterval(go,ms):undefined;return()=>{on=false;t&&clearInterval(t)}},[url,ms]);return{d,e}}

const Err=({e}:{e:string|null})=>!e?null:<div className="border border-down/40 bg-down/10 text-sm px-4 py-2 rounded-sm">{e==='MISSING_KEY'?<>Missing API key — set <code className="font-mono font-bold">FRED_API_KEY</code> in <code>.env.local</code> (or Vercel env vars) and restart.</>:'Market data temporarily unavailable.'}</div>;
const Info=({t}:{t:string})=><span className="group relative ml-1 cursor-help text-slate-500">ⓘ<span className="pointer-events-none absolute left-0 top-5 z-20 hidden w-56 rounded-sm border border-line bg-bg p-2 text-xs normal-case font-normal text-slate-200 group-hover:block">{t}</span></span>;
const Card=({title,children,right}:{title?:string;children:React.ReactNode;right?:React.ReactNode})=><section className="border border-line bg-card p-5 fade">{title&&<div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-bold tracking-[.18em] text-slate-300">{title}</h3>{right}</div>}{children}</section>;
const Src=({s,fr='DAILY',ts}:{s:string;fr?:string;ts?:string|null})=><div className="mt-2 text-[11px] text-slate-500">Source: {s} · <span className="border border-line px-1 text-slate-300">{fr}</span>{ts&&<> · As of {ts}</>}</div>;

function usMarketOpen(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
 const g=(t:string)=>p.find(x=>x.type===t)!.value,m=(+g('hour')%24)*60+ +g('minute');return!['Sat','Sun'].includes(g('weekday'))&&m>=570&&m<960}

function Ticker({q}:{q:Record<string,Q>|undefined}){const items=TICKER.map(k=>{const x=q?.[k];return<span key={k} className="mx-6 inline-flex items-baseline gap-2 whitespace-nowrap text-sm"><b>{SERIES[k].name}</b><span>{f(x?.price,SERIES[k].dec)}</span><span className={col(x?.change)}>{x?.change==null?'':x.change>0?'▲':x.change<0?'▼':''} {sg(x?.change,2)} ({sg(x?.changePercent,2,'%')})</span></span>});
 return<div className="overflow-hidden border-b border-line bg-black py-2"><div className="marquee flex w-max">{items}{items}</div></div>}

function Table({keys,q,extra}:{keys:string[];q?:Record<string,Q>;extra?:Q[]}){const rows=[...keys.map(k=>q?.[k]??({symbol:k,name:SERIES[k].name} as Q)),...(extra??[])];
 return<table className="w-full text-sm"><thead className="text-left text-[11px] tracking-widest text-slate-500"><tr><th className="py-1">ASSET</th><th className="text-right">LAST</th><th className="text-right">TODAY</th><th className="text-right">THIS WEEK</th><th className="text-right">SOURCE</th></tr></thead><tbody>
 {rows.map(r=><tr key={r.symbol} className="border-t border-line"><td className="py-2 font-semibold">{r.name}</td><td className="text-right font-mono">{f(r.price,SERIES[r.symbol]?.dec??2)}</td><td className={`text-right font-mono ${col(r.change)}`}>{sg(r.change)} <span className="text-xs">({sg(r.changePercent,2,'%')})</span></td><td className={`text-right font-mono ${col(r.weekChange)}`}>{sg(r.weekChange)} <span className="text-xs">({sg(r.weekChangePercent,2,'%')})</span></td><td className="text-right text-[11px] text-slate-500">{r.price==null?'N/A':`${r.source} · ${r.frequency}`}</td></tr>)}</tbody></table>}

function Gauge({v}:{v:number}){const r=regimeFor(v),pos=Math.min(v/GAUGE_MAX,1)*100;let prev=0;
 return<div><div className="relative mt-6 flex h-3 overflow-hidden">{REGIMES.map(x=>{const hi=Math.min(x.max,GAUGE_MAX),w=(hi-prev)/GAUGE_MAX*100;prev=hi;return<div key={x.label} style={{width:`${w}%`,background:x.color,opacity:.85}}/>})}
 <div className="absolute -top-2 h-7 w-0.5 bg-white transition-all duration-700" style={{left:`${pos}%`}}/></div>
 <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>0</span>{REGIMES.slice(0,-1).map(x=><span key={x.max}>{x.max}</span>)}<span>{GAUGE_MAX}+</span></div><div className="mt-2 text-xs" style={{color:r.color}}>{r.label}</div></div>}

const tip={contentStyle:{background:'#060b16',border:'1px solid #1c2943',fontSize:12}};
function VixChart({h}:{h:number}){const[range,setRange]=useState('1Y');const{d,e}=useJson<{points:P[]}>(`/api/history?id=VIX&range=${range}`);const pts=d?.points??[];
 return<Card title="VIX — DAILY CLOSE" right={<div className="flex gap-1">{RANGES.map(r=><button key={r} onClick={()=>setRange(r)} className={`px-2 py-1 text-xs font-semibold ${r===range?'bg-accent text-white':'text-slate-400 hover:text-white'}`}>{r}</button>)}</div>}>
 <Err e={e}/>{range==='1D'&&<p className="text-xs text-slate-500">FRED provides daily closes only — 1D shows the last two closes. An intraday provider can be plugged in later.</p>}
 <div style={{height:h}}><ResponsiveContainer><AreaChart data={pts}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity={.25}/><stop offset="1" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1c2943" vertical={false}/><XAxis dataKey="date" stroke="#64748b" tick={{fontSize:11}} minTickGap={50}/><YAxis stroke="#64748b" tick={{fontSize:11}} domain={['auto','auto']}/><Tooltip {...tip}/>
 {REGIMES.slice(0,-1).map(x=><ReferenceLine key={x.max} y={x.max} stroke={x.color} strokeDasharray="3 5" strokeOpacity={.35}/>)}<Area dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#g)" dot={pts.length<40}/></AreaChart></ResponsiveContainer></div>
 <Src s="FRED (St. Louis Fed) / Cboe — VIXCLS" fr="DAILY" ts={pts.at(-1)?.date}/></Card>}

function VixVsSpx({h}:{h:number}){const a=useJson<{points:P[]}>('/api/history?id=VIX&range=1Y'),b=useJson<{points:P[]}>('/api/history?id=SPX&range=1Y');
 const data=useMemo(()=>{const v=a.d?.points,s=b.d?.points;if(!v?.length||!s?.length)return[];const sm=new Map(s.map(p=>[p.date,p.value])),j=v.filter(p=>sm.has(p.date));if(!j.length)return[];return j.map(p=>({date:p.date,VIX:p.value/j[0].value*100,'S&P 500':sm.get(p.date)!/sm.get(j[0].date)!*100}))},[a.d,b.d]);
 return<Card title="VIX vs S&P 500 (REBASED TO 100)"><Err e={a.e??b.e}/>{data.length?<div style={{height:h}}><ResponsiveContainer><LineChart data={data}><CartesianGrid stroke="#1c2943" vertical={false}/><XAxis dataKey="date" stroke="#64748b" tick={{fontSize:11}} minTickGap={50}/><YAxis stroke="#64748b" tick={{fontSize:11}} domain={['auto','auto']}/><Tooltip {...tip}/><Line dataKey="VIX" stroke="#f97316" dot={false} strokeWidth={2}/><Line dataKey="S&P 500" stroke="#e2e8f0" dot={false} strokeWidth={2}/></LineChart></ResponsiveContainer></div>:<p className="py-10 text-center text-slate-400">{a.d||b.d?'N/A':'Data source required.'}</p>}
 <Src s="FRED — VIXCLS (Cboe), SP500 (S&P Dow Jones Indices)"/></Card>}

function TermStructure(){const{d}=useJson<{connected:boolean;points:FuturesPoint[]}>('/api/term-structure');const p=d?.points??[];
 const shape=p.length>1?(p[p.length-1].value>=p[0].value?'CONTANGO':'BACKWARDATION'):null;
 return<Card title="VIX TERM STRUCTURE" right={shape&&<b className={shape==='CONTANGO'?'text-up':'text-down'}>{shape}</b>}>
 {p.length?<div className="h-64"><ResponsiveContainer><LineChart data={p}><CartesianGrid stroke="#1c2943"/><XAxis dataKey="label" stroke="#64748b"/><YAxis stroke="#64748b" domain={['auto','auto']}/><Tooltip {...tip}/><Line dataKey="value" stroke="#3b82f6" strokeWidth={2}/></LineChart></ResponsiveContainer></div>:<p className="py-8 text-center text-slate-400">VIX futures data source not connected.</p>}
 <p className="mt-2 text-xs text-slate-400"><b>Contango</b> generally indicates that longer-dated volatility expectations exceed immediate volatility. <b>Backwardation</b> occurs when near-term volatility is unusually elevated relative to longer-term expectations and can be associated with periods of market stress.</p></Card>}

function News(){const{d}=useJson<{connected:boolean;items:{id:string;timestamp:string;headline:string;category:string}[]}>('/api/news',300000);
 return<Card title="WHAT'S MOVING MARKETS">{d?.items?.length?d.items.map(n=><div key={n.id} className="border-t border-line py-2"><span className="text-[11px] text-slate-500">{n.timestamp}</span> <span className="border border-accent px-1 text-[10px] text-accent">{n.category}</span><div className="font-semibold">{n.headline}</div></div>):<p className="py-8 text-center text-slate-400">Live market news source not connected.</p>}</Card>}

export default function Dashboard(){
 const{d,e}=useJson<{quotes:Record<string,Q>}>('/api/quotes',300000);const hist=useJson<{points:P[]}>('/api/history?id=VIX&range=1Y');
 const q=d?.quotes,v=q?.VIX,an=useMemo(()=>analytics(hist.d?.points??[]),[hist.d]);
 const[present,setPresent]=useState(false),[slide,setSlide]=useState(0),[open,setOpen]=useState(true);
 useEffect(()=>{setOpen(usMarketOpen());const t=setInterval(()=>setOpen(usMarketOpen()),60000);return()=>clearInterval(t)},[]);
 useEffect(()=>{document.documentElement.classList.toggle('present',present)},[present]);
 useEffect(()=>{const k=(ev:KeyboardEvent)=>{if(!present)return;if(ev.key==='ArrowRight')setSlide(s=>Math.min(s+1,6));if(ev.key==='ArrowLeft')setSlide(s=>Math.max(s-1,0));if(ev.key==='Escape')setPresent(false)};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[present]);
 const h=present?460:340;
 const keys=(g:Group)=>Object.keys(SERIES).filter(k=>SERIES[k].group===g);
 const spread=q?.UST10?.price!=null&&q?.UST2?.price!=null?[{symbol:'2s10s',name:'2Y/10Y Spread',price:q.UST10.price-q.UST2.price,change:q.UST10.change!=null&&q.UST2.change!=null?q.UST10.change-q.UST2.change:null,changePercent:null,weekChange:q.UST10.weekChange!=null&&q.UST2.weekChange!=null?q.UST10.weekChange-q.UST2.weekChange:null,weekChangePercent:null,source:'FRED (derived)',frequency:'DAILY'} as Q]:[];
 const movers=Object.values(q??{}).filter(x=>x.weekChangePercent!=null).sort((a,b)=>Math.abs(b.weekChangePercent!)-Math.abs(a.weekChangePercent!)).slice(0,6);
 const reg=v?.price!=null?regimeFor(v.price):null;
 const Group=(g:Group,title:string,extra?:Q[])=><Card title={title}><Table keys={keys(g)} q={q} extra={extra}/><Src s="FRED unless marked N/A (no provider connected)" ts={v?.timestamp}/></Card>;
 const sections=[
 <div key="o" className="space-y-4"><Card title="WEEKLY MARKET SUMMARY — LARGEST MOVES"><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{movers.length?movers.map(m=><div key={m.symbol} className="border border-line p-3"><div className="text-xs text-slate-400">{m.name}</div><div className="text-2xl font-bold">{f(m.price,SERIES[m.symbol].dec)}</div><div className={`text-sm ${col(m.change)}`}>Today: {sg(m.changePercent,1,'%')}</div><div className={`text-sm ${col(m.weekChange)}`}>Week: {sg(m.weekChangePercent,1,'%')}</div></div>):<p className="text-slate-400">N/A</p>}</div></Card>
  <div className="grid gap-4 lg:grid-cols-2">{Group('equities','EQUITIES')}{Group('rates','RATES',spread)}</div></div>,
 <div key="v" className="space-y-4"><Card><div className="flex flex-wrap items-end justify-between gap-6"><div><div className="text-xs tracking-widest text-slate-400">CBOE VOLATILITY INDEX — VIX</div><div className="text-7xl font-bold">{f(v?.price)}</div><div className={`text-lg ${col(v?.change)}`}>{sg(v?.change)} ({sg(v?.changePercent,2,'%')}) today</div></div>
  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">{[['Previous Close',f(v?.previousClose)],['Week Change',sg(v?.weekChange)+` (${sg(v?.weekChangePercent,1,'%')})`],['20-Day Avg',f(an?.avg20)],['52W High',f(an?.hi)],['52W Low',f(an?.lo)],['1Y Percentile',an?`${f(an.pct,0)}th`:'N/A'],['Regime',reg?.label??'N/A'],['Last Updated',v?.timestamp?`${v.timestamp} close`:'N/A']].map(([a,b])=><div key={a}><div className="text-[11px] text-slate-500">{a}</div><div className="font-semibold" style={a==='Regime'?{color:reg?.color}:undefined}>{b}</div></div>)}</div></div>
  {v?.price!=null&&<Gauge v={v.price}/>}<Src s="FRED / Cboe" fr="DAILY · NOT REAL-TIME" ts={v?.timestamp}/></Card>
  <VixChart h={h}/>
  <Card title="VOLATILITY SNAPSHOT"><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{[
  ['VIX Regime',reg?.label??'N/A','Where VIX sits versus the thresholds in lib/config/thresholds.ts.'],
  ['1-Year Percentile',an?`${f(an.pct,0)}th`:'N/A','Share of the past year\'s closes at or below today\'s VIX.'],
  ['20-Day Average',f(an?.avg20),'Mean of the last 20 daily closes — a short-term baseline.'],
  ['Weekly Change',sg(an?.week),'Point change versus the close 5 trading days ago.'],
  ['52-Week Range',an?`${f(an.lo)} – ${f(an.hi)}`:'N/A','Lowest and highest daily close in the trailing year.'],
  ['Expected Daily S&P 500 Move',an?`±${f(an.expMove)}%`:'N/A','Approximation: VIX ÷ √252. VIX is annualized implied vol; 252 trading days.']].map(([a,b,t])=><div key={a} className="border border-line p-3"><div className="text-[11px] tracking-wider text-slate-400">{a.toUpperCase()}<Info t={t}/></div><div className="text-2xl font-bold">{b}</div></div>)}</div><Src s="Calculated from FRED VIXCLS"/></Card>
  <VixVsSpx h={h}/><TermStructure/></div>,
 <div key="r">{Group('rates','RATES',spread)}</div>,<div key="f">{Group('fx','FX')}</div>,<div key="c">{Group('commodities','COMMODITIES')}</div>,<div key="cr">{Group('credit','CREDIT')}</div>,<News key="n"/>];
 return<div className="min-h-screen">
  <Ticker q={q}/>
  <header className="flex items-center justify-between border-b border-line px-6 py-3"><div className="text-lg font-black tracking-wide">GLOBAL CAPITAL MARKETS</div>
   {!present&&<nav className="hidden gap-5 text-xs font-bold tracking-widest text-slate-300 md:flex">{['MARKETS','VOLATILITY','RATES','FX','COMMODITIES','CREDIT','NEWS'].map((n,i)=><a key={n} href={`#s${[0,1,2,3,4,5,6][i]}`} className="hover:text-white">{n}</a>)}</nav>}
   <div className="flex items-center gap-4 text-xs"><span className={`font-bold ${open?'text-up':'text-down'}`}>● US MARKET: {open?'OPEN':'CLOSED'}</span><button onClick={()=>setPresent(!present)} className="border border-accent px-3 py-1 font-bold tracking-widest text-accent hover:bg-accent hover:text-white">{present?'EXIT PRESENTATION':'PRESENTATION MODE'}</button></div></header>
  <main className="mx-auto max-w-[1500px] space-y-6 p-6"><Err e={e}/>
   {present?<><div className="flex items-center justify-between"><h2 className="text-3xl font-black tracking-wide">{NAV[slide]}</h2><div className="flex gap-1">{NAV.map((n,i)=><button key={n} onClick={()=>setSlide(i)} className={`px-2 py-1 text-[11px] font-bold ${i===slide?'bg-accent':'text-slate-400'}`}>{n}</button>)}</div></div><div key={slide}>{sections[slide]}</div><div className="flex justify-between"><button disabled={!slide} onClick={()=>setSlide(slide-1)} className="px-4 py-2 border border-line disabled:opacity-30">← Prev</button><button disabled={slide===6} onClick={()=>setSlide(slide+1)} className="px-4 py-2 border border-line disabled:opacity-30">Next →</button></div></>
   :sections.map((s,i)=><div key={i} id={`s${i}`} className="scroll-mt-4"><h2 className="mb-2 text-xl font-black tracking-widest">{i===1?'MARKET VOLATILITY':NAV[i]}</h2>{s}</div>)}
  </main></div>}
