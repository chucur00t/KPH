# PRODUCTION DEPLOYMENT GUIDE
**KPH Public Intelligence System**  
**Runtime:** Node.js 22 LTS, Vite + React 19, Express, TypeScript, PostGIS  

---

## 1. Architecture Topology

```text
                    INTERNET
                       │
                       ↓
               CLOUDFLARE / CDN
                       │
                       ↓
          CONTAINER HOST (Cloud Run / VPS)
       ┌───────────────────────────────┐
       │   Frontend SPA (Vite / React) │
       │   Backend API (Express / TS)  │
       │   Background Job Scheduler    │
       │   SSRF Guard & Source Probes  │
       └───────────────┬───────────────┘
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      PostgreSQL     Worker       Gemini API
      + PostGIS        │       (Strict Temp 0.1)
          │            │
          └──────┬─────┘
                 ↓
           Object Storage
```

## 2. Environment Configuration

Define in `.env`:
```bash
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
POSTGRES_URL=postgresql://user:password@localhost:5432/kph_intelligence
```

## 3. Build & Execution Commands

```bash
# 1. Install dependencies
npm install

# 2. Compile and typecheck
npm run lint
npm run build

# 3. Execute Production Hardening Test Suite
npx tsx tests/production_hardening.test.ts

# 4. Start production server
npm start
```
