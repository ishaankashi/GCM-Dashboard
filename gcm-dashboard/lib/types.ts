export type Frequency='DAILY'|'DELAYED'|'REAL-TIME';
export interface MarketQuote{symbol:string;name:string;price:number|null;change:number|null;changePercent:number|null;previousClose:number|null;weekChange:number|null;weekChangePercent:number|null;timestamp:string|null;source:string;isDelayed:boolean;frequency:Frequency}
export interface HistoricalDataPoint{date:string;value:number}
export interface MarketDataProvider{name:string;getQuote(id:string):Promise<MarketQuote>;getHistory(id:string,startDate?:string):Promise<HistoricalDataPoint[]>;getMultipleQuotes(ids:string[]):Promise<MarketQuote[]>}
export interface NewsItem{id:string;timestamp:string;headline:string;category:string;source?:string;url?:string}
export interface NewsProvider{getNews():Promise<NewsItem[]>}
export interface FuturesPoint{label:string;months:number;value:number}
export interface TermStructureProvider{getCurve():Promise<FuturesPoint[]>}
