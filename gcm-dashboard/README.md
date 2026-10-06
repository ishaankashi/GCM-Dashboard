# Global Capital Markets — Volatility Dashboard

## Structure
app/(page, layout, api/{quotes,history,news,term-structure}) · components/Dashboard.tsx ·
lib/types.ts (MarketQuote, HistoricalDataPoint, MarketDataProvider, NewsProvider, TermStructureProvider) ·
lib/config/{series.ts (FRED series), thresholds.ts (VIX regimes)} · lib/providers/{fred.ts, index.ts} · lib/analytics.ts

## Run
    npm install
    cp .env.example .env.local   # add your key
    npm run dev                  # http://localhost:3000

## FRED key
Create a free account at https://fredaccount.stlouisfed.org, open "API Keys", request a key, then set
`FRED_API_KEY=...` in `.env.local`. It is read only in server routes (never `NEXT_PUBLIC_`).

## Deploy (Vercel)
Push to GitHub → vercel.com/new → import repo → Settings → Environment Variables → add `FRED_API_KEY` → Deploy.

## Real data now (FRED, daily close, cached 30 min)
Ticker (S&P, Nasdaq, Dow, VIX, 2Y, 10Y, EUR/USD, USD/JPY, WTI), VIX card/chart/snapshot/regime gauge,
VIX vs S&P 500, rates + 2s10s, IG/HY credit OAS, GBP/USD, Brent, weekly summary.

## Needs another provider (shows N/A / "not connected")
DXY, Gold, Silver, Copper, VIX futures term structure, news feed, intraday data. Holidays are not detected in the US MARKET indicator.

## Adding live VIX later
Implement `MarketDataProvider` (e.g. Cboe, Polygon, Databento, Twelve Data) and `TermStructureProvider` for futures,
register in `lib/providers/index.ts`, and label with `frequency:'REAL-TIME'` only if the vendor guarantees it.
Note: FRED SP500 only covers ~10 years; MAX VIX history goes back to 1990.
