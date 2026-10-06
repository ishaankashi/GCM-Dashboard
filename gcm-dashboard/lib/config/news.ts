// Add feeds here. Only use feeds the publisher offers for syndication.
import type {FeedCfg} from '../providers/rss';
export const NEWS_FEEDS:FeedCfg[]=[
 {source:'WSJ',category:'MARKETS',url:'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'},
 {source:'WSJ',category:'BUSINESS',url:'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml'},
 {source:'WSJ',category:'WORLD',url:'https://feeds.a.dj.com/rss/RSSWorldNews.xml'},
 {source:'WSJ',category:'MARKETS',url:'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain'},
 {source:'WSJ',category:'WORLD',url:'https://feeds.content.dowjones.io/public/rss/RSSWorldNews'},
 // Morning Brew: no official public feed found — add one here if you obtain it.
];
