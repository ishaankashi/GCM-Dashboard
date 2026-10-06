// Swap providers here. Add IntradayMarketProvider / CboeProvider by implementing the interfaces in ../types.
import {FredProvider} from './fred';
import type {NewsProvider,TermStructureProvider} from '../types';
import {RssNewsProvider} from './rss';
import {NEWS_FEEDS} from '../config/news';
export const dailyProvider=new FredProvider();
export const newsProvider:NewsProvider|null=new RssNewsProvider(NEWS_FEEDS);
export const termStructureProvider:TermStructureProvider|null=null;
