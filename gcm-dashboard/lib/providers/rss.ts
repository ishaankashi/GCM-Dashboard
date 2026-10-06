import type {NewsItem,NewsProvider} from '../types';
export interface FeedCfg{source:string;url:string;category:string}
const tag=(x:string,t:string)=>{const m=x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`));return m?m[1].replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').trim():''};
export class RssNewsProvider implements NewsProvider{
 constructor(private feeds:FeedCfg[]){}
 async getNews():Promise<NewsItem[]>{
  const res=await Promise.allSettled(this.feeds.map(async (f):Promise<NewsItem[]>=>{
   const r=await fetch(f.url,{next:{revalidate:600},headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15','Accept':'application/rss+xml, application/xml, text/xml, */*'}});if(!r.ok)throw new Error(`${f.url} -> HTTP ${r.status}`);
   const xml=await r.text();
   return xml.split(/<item[ >]/).slice(1).map(it=>({id:tag(it,'link')||tag(it,'guid'),timestamp:(d=>isNaN(+d)?'':d.toISOString())(new Date(tag(it,'pubDate'))),headline:tag(it,'title'),category:f.category,source:f.source,url:tag(it,'link')})).filter(n=>n.headline&&n.timestamp);
  }));
  const ok=res.filter((r):r is PromiseFulfilledResult<NewsItem[]>=>r.status==='fulfilled');
  const items=ok.flatMap(r=>r.value);
  if(!items.length) throw new Error(res.map((r,i)=>r.status==='rejected'?String(r.reason?.message??r.reason):`${this.feeds[i].url} -> 0 items parsed`).join(' | '));
  const seen=new Set<string>();
  return items.filter(n=>!seen.has(n.id)&&!!seen.add(n.id)).sort((a,b)=>+new Date(b.timestamp)-+new Date(a.timestamp)).slice(0,25);
 }}
