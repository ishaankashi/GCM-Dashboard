import {NextResponse} from 'next/server';
import {dailyProvider} from '@/lib/providers';
import {SERIES} from '@/lib/config/series';
import {FredError} from '@/lib/providers/fred';
export async function GET(){
 try{const keys=Object.keys(SERIES),q=await dailyProvider.getMultipleQuotes(keys);
  return NextResponse.json({quotes:Object.fromEntries(keys.map((k,i)=>[k,q[i]]))});
 }catch(e){return NextResponse.json({error:e instanceof FredError?e.code:'UNAVAILABLE'})}}
