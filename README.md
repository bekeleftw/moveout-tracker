# Move-Out Utility Tracker

Personalized move-out utility tracking dashboard for property management companies. Powered by Airtable + Next.js on Vercel.

## Setup

### 1. Airtable

Base ID: `appgIcBu47jihQ9va`

Tables:
- **Companies** - slug, company_name, logo_url, brand_color, Properties (link)
- **Properties** - Company (link), address, city, state, zip, vacant_since, tenant_move_out, Utility Transfers (link)
- **Utility Transfers** - Property (link), utility_type, provider_name, provider_phone, provider_website, transfer_to, target_date, status, notes

### 2. Environment Variables

Create `.env.local` for local dev:

```
AIRTABLE_API_KEY=patXXXXXX
AIRTABLE_BASE_ID=appgIcBu47jihQ9va
```

### 3. Local Development

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000/{company-slug}`

### 4. Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add environment variables (AIRTABLE_API_KEY, AIRTABLE_BASE_ID)
4. Deploy

### 5. Custom Domain (later)

1. In Vercel: Settings > Domains > Add `moveout.utilityprofit.com`
2. In GoDaddy: Add CNAME record: `moveout` → `cname.vercel-dns.com`

## How It Works

- User visits `/{slug}` (e.g., `/marc-1-realty`)
- App calls Airtable API via server-side route
- Renders company's properties with pre-populated provider data
- PM can update status, transfer-to, dates, and notes (writes back to Airtable in real time)
