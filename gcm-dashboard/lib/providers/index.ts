// Swap providers here. Add IntradayMarketProvider / CboeProvider by implementing the interfaces in ../types.
import {FredProvider} from './fred';
import type {NewsProvider,TermStructureProvider} from '../types';
export const dailyProvider=new FredProvider();
export const newsProvider:NewsProvider|null=null;
export const termStructureProvider:TermStructureProvider|null=null;
