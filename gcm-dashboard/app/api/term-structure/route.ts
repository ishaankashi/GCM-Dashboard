import {NextResponse} from 'next/server';
import {termStructureProvider} from '@/lib/providers';
export async function GET(){
 if(!termStructureProvider) return NextResponse.json({connected:false,points:[]});
 try{return NextResponse.json({connected:true,points:await termStructureProvider.getCurve()})}catch{return NextResponse.json({connected:true,points:[],error:'UNAVAILABLE'})}}
