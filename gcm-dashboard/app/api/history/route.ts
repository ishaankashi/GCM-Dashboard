import {NextRequest,NextResponse} from 'next/server';
import {dailyProvider} from '@/lib/providers';
import {SERIES} from '@/lib/config/series';
import {FredError} from '@/lib/providers/fred';
const DAYS:Record<string,number>={'5D':12,'1D':12,'1M':31,'3M':92,'6M':183,'1Y':366,'5Y':1830};
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get('id')??'VIX',r=req.nextUrl.searchParams.get('range')??'1Y';
 if(!SERIES[id]) return NextResponse.json({error:'UNKNOWN_SERIES'},{status:400});
 const now=new Date(),start=r==='MAX'?'1990-01-02':r==='YTD'?`${now.getFullYear()}-01-01`:new Date(+now-(DAYS[r]??366)*864e5).toISOString().slice(0,10);
 try{let pts=await dailyProvider.getHistory(id,start);if(r==='1D')pts=pts.slice(-2);if(r==='5D')pts=pts.slice(-5);
  return NextResponse.json({points:pts});
 }catch(e){return NextResponse.json({error:e instanceof FredError?e.code:'UNAVAILABLE'})}}
