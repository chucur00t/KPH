# PRODUCTION COST ESTIMATE & BUDGET CONTROL
**KPH Public Intelligence System**  
**Budget Classification:** Highly Efficient / Public Sector Optimized  

---

## 1. Component Cost Matrix

| Infrastructure Component | Architecture Model | Cost Level | Estimated Monthly Cost | Notes |
|---|---|---|---|---|
| **Frontend Web Hosting** | Cloudflare Pages / Static CDN | **FREE** | $0.00 | Global edge distribution, unlimited bandwidth |
| **API & Backend Worker** | Cloud Run / Single Container (1 vCPU, 2GB) | **LOW** | $5.00 - $15.00 | Scale-to-zero when idle, Node.js + Express |
| **Database & PostGIS** | Cloud SQL Developer / Supabase Free Tier | **FREE / LOW** | $0.00 - $10.00 | PostGIS 3.3+ spatial database |
| **NASA FIRMS Data Feed**| Open NASA LANCE API | **FREE** | $0.00 | Open government open data policy |
| **Copernicus Sentinel-2**| Open Copernicus STAC Hub | **FREE** | $0.00 | Free & open data policy (EU Copernicus) |
| **BMKG Weather Feeds** | Open BMKG Meteorological API | **FREE** | $0.00 | Open government public weather API |
| **OSINT News Harvester** | Direct RSS & JDIH Public Fetch | **FREE** | $0.00 | Open web public feeds, robots.txt compliant |
| **Gemini AI API** | Gemini 2.5 Flash (`@google/genai`) | **LOW** | $2.00 - $8.00 | Free tier + strict temp 0.1 grounded tokens |
| **Object Storage** | Cloud Storage / R2 | **LOW** | $1.00 - $3.00 | GeoJSON vectors & markdown report backups |

---

## 2. Summary
- **Total Estimated Operating Cost:** **<$25.00 / month** (or **$0.00** using free tier allowances).
- **Zero Paid Proprietary Datasets:** 100% reliant on legally open public data sources.
