// Add a FRED series by adding one line. fred:null = no source connected (shows N/A).
export type Group='equities'|'rates'|'credit'|'fx'|'commodities';
export interface SeriesCfg{name:string;group:Group;fred:string|null;dec:number}
export const SERIES:Record<string,SeriesCfg>={
 SPX:{name:'S&P 500',group:'equities',fred:'SP500',dec:2},
 NASDAQ:{name:'Nasdaq Composite',group:'equities',fred:'NASDAQCOM',dec:2},
 DOW:{name:'Dow Jones',group:'equities',fred:'DJIA',dec:2},
 VIX:{name:'VIX',group:'equities',fred:'VIXCLS',dec:2},
 UST2:{name:'US 2-Year Treasury',group:'rates',fred:'DGS2',dec:2},
 UST5:{name:'US 5-Year Treasury',group:'rates',fred:'DGS5',dec:2},
 UST10:{name:'US 10-Year Treasury',group:'rates',fred:'DGS10',dec:2},
 UST30:{name:'US 30-Year Treasury',group:'rates',fred:'DGS30',dec:2},
 IG:{name:'Investment Grade OAS',group:'credit',fred:'BAMLC0A0CM',dec:2},
 HY:{name:'High Yield OAS',group:'credit',fred:'BAMLH0A0HYM2',dec:2},
 DXY:{name:'DXY',group:'fx',fred:null,dec:2},
 EURUSD:{name:'EUR/USD',group:'fx',fred:'DEXUSEU',dec:4},
 USDJPY:{name:'USD/JPY',group:'fx',fred:'DEXJPUS',dec:2},
 GBPUSD:{name:'GBP/USD',group:'fx',fred:'DEXUSUK',dec:4},
 WTI:{name:'WTI Crude',group:'commodities',fred:'DCOILWTICO',dec:2},
 BRENT:{name:'Brent Crude',group:'commodities',fred:'DCOILBRENTEU',dec:2},
 GOLD:{name:'Gold',group:'commodities',fred:null,dec:2},
 SILVER:{name:'Silver',group:'commodities',fred:null,dec:2},
 COPPER:{name:'Copper',group:'commodities',fred:null,dec:2}};
export const TICKER=['SPX','NASDAQ','DOW','VIX','UST2','UST10','DXY','EURUSD','USDJPY','WTI','GOLD'];
