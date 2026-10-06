import {NextResponse} from 'next/server';
import {newsProvider} from '@/lib/providers';
export async function GET(){
 if(!newsProvider) return NextResponse.json({connected:false,items:[]});
 try{return NextResponse.json({connected:true,items:await newsProvider.getNews()})}catch(e){return NextResponse.json({connected:true,items:[],error:'UNAVAILABLE',detail:e instanceof Error?e.message:String(e)})}}
