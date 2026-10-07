# BLUEPRINT ARSITEKTUR SISTEM: KPH INTELLIGENCE
**Wilayah Target Pilot:** Kesatuan Pengelolaan Hutan (KPH) Sintang Timur & Kabupaten Sintang, Kalimantan Barat  
**Versi Dokumen:** 1.0.0-PROD-SPEC (Fase 1 - Architectural Blueprint)  
**Peran:** Principal Software Architect, GIS Architect, Data Engineer, OSINT Analyst & AI Engineer  

---

## 1. Analisis Kebutuhan & Prinsip Kepatuhan (Compliance & Constraints)

### 1.1 Hard Constraints Enforcement
1. **100% Sumber Data Publik:** Hanya mengonsumsi data yang tersedia secara legal, terbuka, dan publik (Open Data Kementerian, BMKG, NASA FIRMS open feed, USGS Landsat/ESA Copernicus Sentinel open access, Portal Geoportal Satu Data Indonesia, BPS, JDIH, OSM, Open Government Directory).
2. **Zero Internal Data Leak/Dependency:** Tidak menggunakan SMART Patrol internal, laporan patroli tertutup petugas, drone internal, maupun database tertutup milik instansi KPH/Dinas LHK.
3. **No Paid API Assumption:** Arsitektur memanfaatkan free/open endpoints, Direct Public Tile Server (XYZ/WMS), open feeds (GeoJSON/CSV/RSS/Atom), dan open archive mirrors.
4. **Source Traceability & Data Provenance (Audit Trail):** Setiap titik, batas, dan indikasi perubahan terikat ke entitas `data_sources` dan `provenance_records` dengan atribut: `source_name`, `source_url`, `acquisition_date`, `license`, `checksum/hash`, dan `ingestion_timestamp`.
5. **Klausul "Data Tidak Tersedia":** Jika data parsial/tidak ditemukan, sistem melarang inferensi halusinatif dan wajib menyajikan label eksplisit `"Data tidak tersedia"`.
6. **No Automated Criminalization (Bukan Vonis Hukum Otomatis):** Sistem dilarang secara otomatis memberi status "Illegal Logging" atau "Aktivitas Ilegal" tanpa verifikasi faktual lapangan yang berwenang. Sistem mengklasifikasikan bukti ke dalam 5 taksonomi ketat:
   - `Observation`: Fakta teramati langsung oleh instrumen satelit/sensor (misal: radiasi termal 350 Kelvin).
   - `Detection`: Algoritma mendeteksi anomali komparatif (misal: penurunan tajam indeks NDVI > 0.35).
   - `Correlation`: Pertemuan spasio-temporal dua fenomena (misal: deteksi deforestasi berada di dalam zona Hutan Lindung berjarak 200m dari jalan umum).
   - `Reported Information`: Data sekunder dari media massa/publikasi publik/JDIH/press release LSM.
   - `Verification`: Status validasi dari tim verifikator manusia atau data pembanding independen.
7. **Strict AI Guardrails (Anti-Halusinasi):** Model LLM (Gemini) hanya beroperasi sebagai *Analytical Synthesizer* berbasis *grounded context* (RAG) dari database internal data publik. AI dibatasi instruksi sistem deterministik agar tidak pernah memproduksi nama perusahaan, nomor izin SK, atau koordinat yang tidak ada dalam database terverifikasi.

---

## A. SYSTEM ARCHITECTURE

```
                                  [ PUBLIC DATA UNIVERSE ]
   +-----------------------------------------------------------------------------------+
   | Satellite (Sentinel-2, Landsat, NASA FIRMS, MODIS/VIIRS Hotspots)                 |
   | Geo-Portals (Satu Data Kalbar, Geoportal KLHK, Bappeda Sintang, Ina-Geoportal)    |
   | Hydro/Roads/Admin (OpenStreetMap, Badan Informasi Geospasial / BIG)               |
   | Weather & Atmosphere (BMKG Open API / Open-Meteo Public API)                      |
   | OSINT & Regulations (JDIH Sintang, Antara Kalbar, Media Publik, PPID, BPS)        |
   +-----------------------------------------------------------------------------------+
                                            |
                                  HTTPS / FTP / OGC / RSS
                                            v
   +-----------------------------------------------------------------------------------+
   |                     INGESTION & DATA INTEGRITY LAYER (Node.js/Python)              |
   |  - Spatial Collectors (WMS/WFS/XYZ Harvest, NASA CSV/SHP Parser, GeoJSON Scrapers)|
   |  - OSINT & RSS Collectors (JDIH Crawler, News Ingester, Gazette Harvester)        |
   |  - Sanitizer, De-duplicator & Checksum Hash Generator (SHA-256)                   |
   |  - Schema Normalizer & Coordinate System Projector (EPSG:4326 & EPSG:3857)        |
   +-----------------------------------------------------------------------------------+
                                            |
                                            v
   +-----------------------------------------------------------------------------------+
   |                 PERSISTENCE & SPATIAL ENGINE (PostgreSQL + PostGIS)               |
   |  - Core Geospatial Tables (Admin, Boundaries, Rivers, Roads, Peat, Concessions)   |
   |  - Observation Tables (Raw Hotspots, Land Change Tiles, Weather Measurements)     |
   |  - Entity Intelligence & Correlation Tables (Events, Alerts, Provenance)          |
   |  - Spatial Indexing: GIST Index on geometry, BRIN on timestamps                   |
   +-----------------------------------------------------------------------------------+
                                            |
                                            v
   +-----------------------------------------------------------------------------------+
   |                     INTELLIGENCE & CORRELATION ENGINE (Core API)                  |
   |  - Spatial Intersector (ST_Intersects, ST_DWithin: Hotspot <-> KPH Zone <-> Peat) |
   |  - Temporal Clusterer (ST_ClusterDBSCAN: Spatio-temporal fire event grouping)     |
   |  - Land Change Analyzer (NDVI / dNDVI variance detection & buffer tracking)       |
   |  - Grounded Context Synthesizer (Gemini API with Strict Grounding & Source Links)  |
   |  - Briefing & Alert Generator (Deterministic rules + Evidence compilation)        |
   +-----------------------------------------------------------------------------------+
                                            |
                                REST API & GeoJSON / Vector Tiles
                                            v
   +-----------------------------------------------------------------------------------+
   |                          PRESENTATION LAYER (Vite + React + TS)                   |
   |  - MapLibre GL / Vector Tile GIS Viewer (Layer switch, GeoJSON overlays)          |
   |  - Executive Briefing Dashboard (KPI, Anomaly Counter, Evidence Explorer)         |
   |  - Intelligence Event Timeline (Provenance inspector, Side-by-side verification)  |
   |  - OSINT Feed & Source Traceability Inspector (100% Auditable link)               |
   +-----------------------------------------------------------------------------------+
```

---

## B. COMPONENT ARCHITECTURE

1. **Ingestion & Fetching Subsystems:**
   - `NASA FIRMS Harvester`: Mengambil data hotspot harian area Sintang (BBox: Lat 0.05 to -1.15, Lon 111.15 to 113.35) via VIIRS (S-NPP, NOAA-20/21) dan MODIS open CSV/GeoJSON.
   - `Sentinel/Landsat Imagery & Change Ingester`: Memproses metadata komputasi indeks vegetasi (NDVI, NBR) dari data open-access Copernicus/STAC API.
   - `Public Geoportal Harvester`: Sinkronisasi batas administrasi Kab. Sintang, KPH Sintang Timur (Fungsi Kawasan: HL, HP, HPT, HPK, KSA/KPA), Peta Indikatif Penghentian Izin Baru (PIPIB), Kawasan Hidrologis Gambut (KHG), dan izin pelepasan/konsesi publik (ESDM Minerba One Map, Kementerian ATR/BPN publik).
   - `Weather & Fire Hazard Ingester`: Mengonsumsi curah hujan harian, kelembaban, dan indeks kemudahan terbakar (FFMC/FWI) publik.
   - `OSINT Crawler & Sanitizer`: Scraping legal RSS feed publik (Antara Kalbar, Suara Pemred Kalbar, Pontianak Post, situs Pemkab Sintang, JDIH Sintang) dengan metadata pembeda opini vs fakta peristiwa.

2. **Processing & Spatial Correlation Engine:**
   - `Spatio-Temporal Aggregator`: Mengelompokkan titik hotspot individual menjadi `Fire Event` menggunakan algoritma *DBSCAN spatial clustering* (radius 1.5 km, jendela waktu 48 jam).
   - `Spatial Intersector`: Mengidentifikasi perpotongan geometrik deteksi terhadap:
     - Batas Kawasan Hutan KPH Sintang Timur (Hutan Lindung, Hutan Produksi Tetap, Hutan Produksi Terbatas).
     - Kedalaman Gambut / Kawasan Hidrologis Gambut (KHG).
     - Koridor Buffer Sungai (100m) dan Koridor Buffer Akses Jalan (500m).
     - Status Perhutanan Sosial publik / Konsesi resmi yang terdata publik.
   - `Evidence Correlation Engine`: Menautkan temuan spasial (contoh: deforestasi 12 Ha di Hutan Lindung) dengan artikel berita publik lokal (contoh: berita perambahan di Kec. Ambalau).

3. **Grounded AI Analysis Engine (Gemini 2.5 / 2.0 Flash Integration):**
   - Menghasilkan narasi *Executive Intelligence Briefing* (Harian, Mingguan, Bulanan).
   - Aturan ketat: Format *prompt* menyuntikkan dokumen JSON hasil query PostGIS sebagai *single source of truth*. Prompt menginstruksikan model untuk menandai setiap klaim dengan tag sitasi `[Ref: EVENT-ID]` dan melarang penambahan entitas luar.

4. **Web GIS Dashboard Client:**
   - Single-Page Application (SPA) responsif berstandar enterprise.
   - Menggunakan MapLibre GL JS untuk rendering ribuan titik/vektor secara hardware-accelerated.
   - Panel terpisah antara ringkasan eksekutif, peta interaktif, feed OSINT, dan penelusuran bukti (*provenance inspector*).

---

## C. DATA FLOW DIAGRAM (TEXTUAL REPRESENTATION)

```
[EXTERNAL PUBLIC DATA]
   |
   +--> 1. NASA FIRMS (CSV API) ---------> [Raw Ingest Worker]
   |                                               |
   +--> 2. Sentinel/Landsat Open STAC ---> [STAC Ingest Worker]
   |                                               |
   +--> 3. Geoportal Satu Data / OSM ----> [Vector Ingest Worker]
   |                                               |
   +--> 4. Public News RSS / JDIH -------> [OSINT Ingest Worker]
                                                   |
                                                   v
                                   [Data Sanitizer & Normalizer]
                                   - Validasi Bounding Box Sintang
                                   - Validasi ISO-8601 Timestamps
                                   - Transformasi Proyeksi -> EPSG:4326
                                   - Hash Checksum SHA-256
                                                   |
                                                   v
                                     [PostgreSQL 16 + PostGIS]
                                     - Staging: raw_*
                                     - Core GIS: spatial_*
                                                   |
                                                   v
                                   [Spatial Correlation Worker]
                                   - ST_Intersects(detection, kph_zone)
                                   - Buffer Proximity (Roads & Rivers)
                                   - DBSCAN Event Clustering
                                                   |
                                                   v
                                      [Intelligence Synthesizer]
                                      - Assign Taxonomy (Observation/Detection)
                                      - Calculate Confidence Score (0-100)
                                      - Contextualize with Public News
                                                   |
                                                   +-------------------------+
                                                   |                         |
                                                   v                         v
                                        [Gemini Grounded AI]       [GeoJSON / REST API]
                                        - Executive Summary               |
                                        - Factual Briefing Only           v
                                                   |            [React Web GIS Dashboard]
                                                   +---------------------> |
```

---

## D. DATABASE ERD (TEXTUAL REPRESENTATION)

```
 +--------------------------------------------------------------------------------+
 |                                 data_sources                                   |
 +--------------------------------------------------------------------------------+
 | PK id                    VARCHAR(64)                                           |
 |    source_code           VARCHAR(50) UNIQUE (e.g. 'NASA_FIRMS_VIIRS', 'BIG_OSM')|
 |    source_name           VARCHAR(255)                                          |
 |    organization          VARCHAR(255)                                          |
 |    base_url              TEXT                                                  |
 |    license_type          VARCHAR(100) (e.g. 'Open Access', 'ODbL', 'CC-BY-4.0')|
 |    update_frequency      VARCHAR(50)                                           |
 |    is_public             BOOLEAN DEFAULT TRUE                                  |
 |    reliability_rating    VARCHAR(20) (e.g. 'OFFICIAL_GOV', 'SATELLITE_SENSOR') |
 |    created_at            TIMESTAMPTZ                                           |
 +--------------------------------------------------------------------------------+
          | 1
          |
          | N
 +--------------------------------------------------------------------------------+
 |                              provenance_records                                |
 +--------------------------------------------------------------------------------+
 | PK id                    UUID                                                  |
 | FK source_id             VARCHAR(64) -> data_sources(id)                       |
 |    raw_payload_url       TEXT (Relative path / public canonical link)          |
 |    checksum_sha256       CHAR(64)                                              |
 |    retrieval_timestamp   TIMESTAMPTZ                                           |
 |    retrieval_status      VARCHAR(30) ('SUCCESS', 'PARTIAL', 'FETCH_FAILED')    |
 |    http_status_code      INTEGER                                               |
 |    error_message         TEXT NULL                                             |
 |    records_ingested      INTEGER                                               |
 +--------------------------------------------------------------------------------+
          | 1
          |
          | N
 +--------------------------------------------------------------------------------+
 |                             spatial_boundaries                                 |
 +--------------------------------------------------------------------------------+
 | PK id                    UUID                                                  |
 | FK provenance_id         UUID -> provenance_records(id)                        |
 |    boundary_type         VARCHAR(50) ('KPH_BORDER', 'KECAMATAN', 'DESA',       |
 |                                      'KAWASAN_HUTAN', 'KHG_GAMBUT',            |
 |                                      'PERHUTANAN_SOSIAL', 'KONSESI_PUBLIK')    |
 |    name                  VARCHAR(255) (e.g. 'KPH Sintang Timur', 'Ambalau')    |
 |    category              VARCHAR(100) ('HL', 'HPT', 'HP', 'HPK', 'KSA_KPA')    |
 |    legal_reference       VARCHAR(255) NULL (Nomor SK Penetapan Publik)         |
 |    area_hectares         NUMERIC(14,2)                                         |
 |    geom                  GEOMETRY(MultiPolygon, 4326)                          |
 |    properties            JSONB                                                 |
 +--------------------------------------------------------------------------------+

 +--------------------------------------------------------------------------------+
 |                               raw_hotspots                                     |
 +--------------------------------------------------------------------------------+
 | PK id                    UUID                                                  |
 | FK provenance_id         UUID -> provenance_records(id)                        |
 |    satellite             VARCHAR(30) ('VIIRS_SNPP', 'VIIRS_NOAA20', 'MODIS')   |
 |    acq_date              DATE                                                  |
 |    acq_time              VARCHAR(4) (UTC 'HHMM')                               |
 |    latitude              NUMERIC(9,6)                                          |
 |    longitude             NUMERIC(9,6)                                          |
 |    brightness_kelvin     NUMERIC(6,2)                                          |
 |    frp_mw                NUMERIC(8,2) (Fire Radiative Power)                   |
 |    confidence_level      VARCHAR(20) ('nominal', 'high', 'low', '85%')         |
 |    geom                  GEOMETRY(Point, 4326)                                 |
 +--------------------------------------------------------------------------------+
          | N
          |
          | 1 (Nullable: correlated cluster)
 +--------------------------------------------------------------------------------+
 |                            intelligence_events                                 |
 +--------------------------------------------------------------------------------+
 | PK id                    UUID                                                  |
 |    event_code            VARCHAR(64) UNIQUE (e.g. 'EVT-STG-202609-0012')       |
 |    event_type            VARCHAR(50) ('FIRE_CLUSTER', 'CANOPY_LOSS',           |
 |                                      'ENCROACHMENT_INDICATION', 'OSINT_ISSUE') |
 |    taxonomic_stage       VARCHAR(30) ('OBSERVATION', 'DETECTION',              |
 |                                      'CORRELATION', 'REPORTED', 'VERIFIED')    |
 |    title                 VARCHAR(255)                                          |
 |    description           TEXT                                                  |
 |    first_detected_at     TIMESTAMPTZ                                           |
 |    last_detected_at      TIMESTAMPTZ                                           |
 |    kph_unit              VARCHAR(100) ('KPH Sintang Timur')                    |
 |    kecamatan             VARCHAR(100)                                          |
 |    desa                  VARCHAR(100) NULL                                     |
 |    forest_function       VARCHAR(50) ('Hutan Lindung', 'HPT', 'Non-Kawasan')   |
 |    is_peatland           BOOLEAN DEFAULT FALSE                                 |
 |    proximity_river_m     NUMERIC(10,2) NULL                                    |
 |    proximity_road_m      NUMERIC(10,2) NULL                                    |
 |    confidence_score      INTEGER (0 to 100)                                    |
 |    evidence_summary      JSONB (List of evidence objects + references)         |
 |    verification_status   VARCHAR(30) ('UNVERIFIED', 'DESK_VERIFIED',           |
 |                                      'GROUND_VALIDATION_NEEDED', 'DISPROVED')  |
 |    geom                  GEOMETRY(Geometry, 4326)                              |
 |    centroid              GEOMETRY(Point, 4326)                                 |
 |    created_at            TIMESTAMPTZ                                           |
 +--------------------------------------------------------------------------------+
          | 1
          |
          +---------------+-----------------------------+
          | N             | N                           | N
 +-----------------+ +-------------------------+ +-------------------------------+
 |  event_evidence | |   event_correlations    | |     executive_briefings       |
 +-----------------+ +-------------------------+ +-------------------------------+
 | PK id           | | PK id                   | | PK id                         |
 | FK event_id     | | FK event_id_a           | |    briefing_type (DAILY/WEEK) |
 |    evidence_type| | FK event_id_b           | |    period_start, period_end   |
 |    source_url   | |    correlation_type     | |    executive_summary (Text)   |
 |    evidence_meta| |    distance_meters      | |    key_metrics (JSONB)        |
 |    raw_snippet  | |    temporal_diff_hours  | |    grounded_citations (JSONB) |
 +-----------------+ +-------------------------+ +-------------------------------+

 +--------------------------------------------------------------------------------+
 |                                 osint_records                                  |
 +--------------------------------------------------------------------------------+
 | PK id                    UUID                                                  |
 | FK provenance_id         UUID -> provenance_records(id)                        |
 |    source_name           VARCHAR(255) (e.g. 'Antara Kalbar', 'JDIH Sintang')   |
 |    article_title         VARCHAR(500)                                          |
 |    article_url           TEXT UNIQUE                                           |
 |    published_date        TIMESTAMPTZ                                           |
 |    author_or_agency      VARCHAR(255)                                          |
 |    full_text_content     TEXT                                                  |
 |    extracted_locations   JSONB (Array of recognized names in Sintang)          |
 |    extracted_topics      TEXT[] (e.g. ['karhutla', 'sungai melawi', 'sawit'])  |
 |    approximate_geom      GEOMETRY(Point, 4326) NULL                            |
 |    geocoding_precision   VARCHAR(30) ('DESA', 'KECAMATAN', 'KABUPATEN', 'NONE')|
 |    created_at            TIMESTAMPTZ                                           |
 +--------------------------------------------------------------------------------+
```

---

## E. DAFTAR LENGKAP TABEL POSTGRESQL / POSTGIS

1. `data_sources`: Master katalog seluruh data publik resmi (metadata, lisensi, url basis, reliabilitas).
2. `provenance_records`: Audit log pengambilan data (timestamp, response HTTP, hash SHA-256 data, jumlah record).
3. `spatial_boundaries`: Geometri batas administrasi (KPH Sintang Timur, Kecamatan Sintang, Serawai, Ambalau, Kayan Hulu, dll.), fungsi kawasan hutan KLHK, dan Peta Indikatif Gambut.
4. `spatial_infrastructures`: Data publik jaringan jalan (arteri, kolektor, logistik/kebun publik) dan hidrologi (Sungai Kapuas, Sungai Melawi, anak sungai).
5. `spatial_concessions_public`: Data izin publik terbuka (HGU terdaftar publik, IUP Minerba publik dari Geoportal ESDM, SK Perhutanan Sosial).
6. `raw_hotspots`: Seluruh deteksi titik panas mentah satelit (VIIRS 375m & MODIS 1km) dengan koordinat, suhu, dan FRP.
7. `raw_land_changes`: Hasil deteksi piksel anomali kanopi vegetasi satelit (NDVI change, loss event).
8. `weather_observations`: Data historis dan prakiraan cuaca harian Kabupaten Sintang dari BMKG/Open-Meteo.
9. `osint_records`: Berita resmi, lembaran daerah, dan informasi publik terkait isu kehutanan/lingkungan Sintang.
10. `intelligence_events`: Entitas kejadian terkonsolidasi (kluster kebakaran, indikasi deforestasi, temuan spasial berkorelasi).
11. `event_evidence`: Relasi bukti spesifik berantai per event yang merujuk langsung ke `provenance_records`.
12. `event_correlations`: Tabel relasi n-ke-n yang menghubungkan dua atau lebih event (misal kebakaran berulang di lokasi deforestasi yang sama).
13. `executive_briefings`: Dokumen ringkasan intelijen harian/mingguan/bulanan yang dihasilkan dari sintesis fakta grounded.
14. `system_health_logs`: Status berkala setiap ingestion worker, konektivitas feed data publik, dan latensi query spasial.

---

## F. API SPECIFICATION AWAL (RESTful JSON + GeoJSON)

| HTTP Method | Endpoint | Deskripsi | Parameter Kunci |
|---|---|---|---|
| `GET` | `/api/v1/health` | Status kesehatan sistem, worker publik, dan koneksi DB | - |
| `GET` | `/api/v1/kpi/executive` | Matriks ringkasan eksekutif (luas KPH, hotspot aktif, deforestasi, alert) | `time_range=24h/7d/30d`, `kph_id` |
| `GET` | `/api/v1/spatial/layers` | Katalog layer spasial publik yang tersedia dan status versinya | - |
| `GET` | `/api/v1/spatial/boundaries` | Vektor GeoJSON batas KPH Sintang Timur, Kawasan Hutan, & KHG | `layer_type`, `simplify_tolerance` |
| `GET` | `/api/v1/events` | Daftar Intelligence Events berfilter bukti dan taksonomi | `type`, `stage`, `date_start`, `date_end`, `limit` |
| `GET` | `/api/v1/events/:id` | Detail lengkap satu event intelligence dengan seluruh rantai bukti | `id` (UUID atau Event Code) |
| `GET` | `/api/v1/events/geojson` | Vektor titik dan poligon event intelligence untuk layer map viewer | `bbox`, `type`, `time_window` |
| `GET` | `/api/v1/fire-intelligence/hotspots` | Titik hotspot publik NASA FIRMS dalam BBox Sintang | `hours=24/48/72`, `confidence=high/all` |
| `GET` | `/api/v1/fire-intelligence/clusters` | Kluster kebakaran hasil kalkulasi spasio-temporal DBSCAN | `min_points`, `days` |
| `GET` | `/api/v1/land-change/detections` | Deteksi anomali perubahan tutupan lahan & buffer jalan/sungai | `zone_type`, `min_hectares` |
| `GET` | `/api/v1/osint/articles` | Feed berita & rilis publik yang telah tergeolokasi | `keyword`, `kecamatan`, `page` |
| `GET` | `/api/v1/provenance/:id` | Audit jejak sumber data publik asli, payload hash, & link asal | `id` |
| `GET` | `/api/v1/briefings/latest` | Dokumen Executive Intelligence Briefing terbaru | `format=json/markdown` |
| `POST`| `/api/v1/briefings/synthesize` | Trigger generator briefing terkontrol via Gemini (Read-only context) | `period=daily/weekly` |

---

## G. PROJECT FOLDER STRUCTURE

```
kph-intelligence/
├── .env.example                     # Definisi variabel lingkungan publik & API Gemini
├── metadata.json                    # Metadata aplikasi resmi
├── index.html                       # Entry point HTML dengan meta tag SEO
├── package.json                     # Konfigurasi dependensi runtime
├── tsconfig.json                    # Konfigurasi TypeScript
├── vite.config.ts                   # Konfigurasi Vite & Tailwind CSS
├── docs/                            # Dokumentasi arsitektur dan spesifikasi data
│   └── ARCHITECTURE_BLUEPRINT.md    # Dokumen ini
├── server/                          # Backend Node.js / Express Architecture
│   ├── server.ts                    # Entry point Express backend
│   ├── config/                      # Konfigurasi database, batas BBox Sintang, default
│   │   ├── constants.ts             # BBox KPH Sintang: [111.15, -1.15, 113.35, 0.05]
│   │   └── database.ts              # Pool koneksi PostgreSQL/PostGIS
│   ├── controllers/                 # Handler request API
│   │   ├── executive.controller.ts
│   │   ├── fire.controller.ts
│   │   ├── landchange.controller.ts
│   │   ├── osint.controller.ts
│   │   ├── events.controller.ts
│   │   └── briefing.controller.ts
│   ├── services/                    # Logika bisnis & integrasi eksternal
│   │   ├── ingestion/               # Worker penarik data publik
│   │   │   ├── firms.ingester.ts    # NASA FIRMS Open Feed
│   │   │   ├── geoportal.ingester.ts# Geoportal / Spatial Data
│   │   │   ├── weather.ingester.ts  # BMKG / Open-Meteo
│   │   │   └── osint.crawler.ts     # Public RSS / News Feeds
│   │   ├── spatial/                 # Algoritma analisis geospasial
│   │   │   ├── clusterer.ts         # DBSCAN Hotspot Spatio-Temporal Grouping
│   │   │   └── intersection.ts      # Spatial Joins (Kawasan Hutan, Buffer)
│   │   ├── intelligence/            # Mesin korelasi event & scoring
│   │   │   └── correlator.ts        # Correlation Engine
│   │   └── ai/                      # Integrasi Gemini API
│   │       ├── gemini.client.ts     # Client @google/genai
│   │       └── briefing.prompt.ts   # Guarded Grounded Briefing Prompt
│   ├── routes/                      # Definisi rute REST API
│   │   └── v1.routes.ts
│   └── utils/                       # Hashing SHA-256, sanitasi, error handler
│       ├── checksum.ts
│       └── logger.ts
└── src/                             # Frontend React + TypeScript SPA
    ├── main.tsx                     # Entry point client
    ├── App.tsx                      # Root component navigasi & shell dashboard
    ├── index.css                    # Tailwind CSS v4 styling
    ├── assets/                      # Ikon & grafis representatif
    ├── components/                  # Komponen UI modular
    │   ├── common/                  # Badge taksonomi, modal bukti, error state
    │   │   ├── TaxonomyBadge.tsx    # Observation/Detection/Correlation/Reported/Verified
    │   │   ├── ProvenanceModal.tsx  # Viewer jejak sumber data publik
    │   │   └── StatCard.tsx         # KPI Metric widget
    │   ├── layout/                  # Sidebar, header, breadcrumbs, status bar
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   ├── map/                     # Komponen GIS interaktif
    │   │   ├── MapContainer.tsx     # MapLibre GL engine wrapper
    │   │   ├── LayerControl.tsx     # Pengendali layer batas, titik api, tutupan
    │   │   ├── EventPopup.tsx       # Popup inspect detail event & bukti
    │   │   └── Legend.tsx           # Legenda tematik kehutanan & bahaya api
    │   ├── dashboard/               # View Tab: Executive Dashboard
    │   │   └── ExecutiveView.tsx
    │   ├── landchange/              # View Tab: Land Change Intelligence
    │   │   └── LandChangeView.tsx
    │   ├── fire/                    # View Tab: Fire Intelligence
    │   │   └── FireView.tsx
    │   ├── osint/                   # View Tab: OSINT Feed & Gazette Explorer
    │   │   └── OsintView.tsx
    │   ├── events/                  # View Tab: Event Registry & Correlation
    │   │   └── EventsRegistryView.tsx
    │   ├── timeline/                # View Tab: Temporal Chronology
    │   │   └── TimelineView.tsx
    │   ├── sources/                 # View Tab: Public Data Sources & Audit Log
    │   │   └── DataSourcesView.tsx
    │   ├── reports/                 # View Tab: Executive Briefing & Export
    │   │   └── BriefingReportView.tsx
    │   └── health/                  # View Tab: System & Ingestion Health
    │       └── SystemHealthView.tsx
    ├── hooks/                       # Custom hooks (useEvents, useHotspots, useMapLayers)
    ├── services/                    # API Client axios/fetch wrappers
    │   └── apiClient.ts
    └── types/                       # TypeScript interfaces & enums
        ├── gis.ts
        ├── events.ts
        └── provenance.ts
```

---

## H. SECURITY MODEL & GOVERNANCE

1. **Prinsip Least-Privilege & Read-Only Ingestion:**
   - Semua konektor eksternal hanya memiliki hak *read-only* terhadap data publik.
   - Tidak ada kredensial sensitif atau API key pihak ketiga yang diekspos ke client-side.
2. **Server-Side Reverse Proxy (`/api/*`):**
   - Kunci API (seperti `GEMINI_API_KEY`) diakses secara eksklusif di backend Node.js (`server/`).
   - Browser pengguna tidak pernah menghubungi API AI atau data scraper secara langsung tanpa melewati validasi backend.
3. **Data Immutability & Anti-Tampering:**
   - Rekam jejak *provenance* menerapkan *append-only log*.
   - Setiap payload publik yang diunduh dihitung nilai hash SHA-256 nya. Jika ada data yang diubah atau dikompromikan, checksum akan mendeteksi inkonsistensi.
4. **Input Sanitization & Spatial Boundary Enforcer:**
   - Semua koordinat dan parameter geografis difilter ketat dalam batas geografis Kabupaten Sintang dan KPH Sintang Timur (`EPSG:4326`: Lat -1.5 s/d 0.5, Lon 111.0 s/d 113.8) untuk memblokir injeksi *out-of-bound spatial query*.

---

## I. DATA PROVENANCE MODEL

Setiap entitas data dalam sistem wajib memiliki tautan metadata turunan:
1. `source_id`: Pengenal unik sumber (contoh: `NASA_FIRMS_VIIRS_SNPP`).
2. `canonical_url`: Tautan publik langsung ke laman/API data asli (contoh: `https://firms.modaps.eosdis.nasa.gov/`).
3. `ingested_at`: Waktu presisi pengambilan data oleh sistem (ISO-8601 UTC).
4. `source_hash`: Hash SHA-256 dari respon mentah sumber publik.
5. `data_curator`: Instansi atau lembaga penyedia data resmi (misal: "Badan Informasi Geospasial", "NASA LANCE", "BMKG").
6. `license_clause`: Pernyataan lisensi publik (misal: "NASA Earth Science Open Data Policy", "Open Government Data Indonesia").

---

## J. EVENT MODEL

Setiap kejadian (*Event Intelligence*) dibentuk berdasarkan taksonomi ketat:
```typescript
export interface IntelligenceEvent {
  event_id: string;               // e.g. "EVT-STG-2026-0926-004"
  event_type: 'FIRE_CLUSTER' | 'CANOPY_ANOMALY' | 'ROAD_ENCROACHMENT' | 'OSINT_CORRELATED';
  taxonomic_stage: 'OBSERVATION' | 'DETECTION' | 'CORRELATION' | 'REPORTED' | 'VERIFIED';
  timestamp_start: string;        // ISO 8601
  timestamp_latest: string;       // ISO 8601
  location: {
    latitude: number;
    longitude: number;
    kph_unit: "KPH Sintang Timur";
    kecamatan: string;            // e.g. "Ambalau", "Serawai", "Kayan Hilir"
    desa?: string;
    forest_function: "Hutan Lindung (HL)" | "Hutan Produksi Terbatas (HPT)" | "Hutan Produksi Tetap (HP)" | "Areal Penggunaan Lain (APL)";
    is_peatland: boolean;         // Indikasi Kesatuan Hidrologis Gambut (KHG)
    distance_to_nearest_river_m: number;
    distance_to_nearest_road_m: number;
  };
  geometry: GeoJSON.Geometry;
  evidence: Array<{
    evidence_type: 'SATELLITE_HOTSPOT' | 'OPTICAL_SPECTRAL_LOSS' | 'NEWS_REPORT' | 'REGULATORY_DOC';
    source_name: string;
    source_url: string;
    observation_value: string;   // e.g. "FRP 42.5 MW, Suhu Kecerahan 348 K"
    recorded_at: string;
  }>;
  confidence: {
    score: number;               // 0 - 100%
    rationale: string;           // Formula kalkulasi berbasis jumlah konfirmasi instrumen
  };
  status: 'ACTIVE_MONITORING' | 'HISTORICAL_RESOLVED' | 'UNDER_GROUND_CHECK';
  related_events: string[];      // Array of event_id
}
```

---

## K. INTELLIGENCE MODEL (Taxonomy & Grounded AI)

1. **Aturan Taksonomi Ketat:**
   - **Observation:** Nilai instrumen langsung tanpa manipulasi (misal: 1 titik hotspot VIIRS terdeteksi pada 2026-09-26 05:42 UTC di koordinat 0.124 N, 112.564 E).
   - **Detection:** Analisis algoritma berbasis ambang batas (misal: 4 titik hotspot berdekatan dalam radius 800m membentuk kluster api aktif berenergi tinggi).
   - **Correlation:** Penggabungan spasial deteksi terhadap data tematik batas (misal: Kluster api aktif berada 150m di dalam zona Hutan Lindung KPH Sintang Timur dan berada di atas lahan gambut KHG Sungai Kapuas-Sungai Melawi).
   - **Reported Information:** Keterangan sekunder dari media massa publik (misal: Antara Kalbar merilis berita warga mencium asap di Kecamatan Ambalau).
   - **Verification:** Catatan peninjauan administratif atau data satelit resolusi tinggi pembanding.
2. **AI Anti-Hallucination Sandbox (Gemini):**
   - Gemini diakses dengan *Strict Temperature = 0.1*.
   - Input prompt dibatasi ke struktur data JSON yang diekstrak langsung dari query PostGIS.
   - Aturan larangan tegas: *"Dilarang menyebutkan nama izin perusahaan, korporasi, atau tuduhan perbuatan melawan hukum jika data atribut resmi tidak memuat nama tersebut. Gunakan terminologi indikatif dan faktual."*

---

## L. UI INFORMATION ARCHITECTURE (10 Modul Utama)

1. **Executive Dashboard:**
   - KPI Bar: Luas Wilayah KPH Dipantau (Ha), Total Hotspot 48 Jam, Total Kluster Kebakaran Aktif, Luas Indikasi Perubahan Tutupan (Ha), Berita Publik Terkorelasikan.
   - Peta Situasi Mini (Ringkasan spasial real-time).
   - Grafik Tren Temporal 30 Hari (Hotspot vs Curah Hujan).
   - Daftar Alert Spasial Prioritas Tinggi Berdasarkan Bukti.
2. **Intelligence Map:**
   - Kanvas Peta Interaktif MapLibre GL dengan basemap satelit/topografi publik.
   - Pengendali Layer Spasial (Batas KPH Sintang Timur, Fungsi Kawasan, Gambut, Sungai, Jalan, Hotspot, Perubahan Tutupan Lahan).
   - Fitur Filter Temporal (24 jam, 7 hari, 30 hari, kustom).
   - Pop-up Interaktif: Menampilkan rincian apa yang terdeteksi, kapan terdeteksi, lokasi, sumber data, rantai bukti, confidence, dan link URL sumber publik asli.
3. **Land Change Intelligence:**
   - Modul pemantauan anomali kanopi vegetasi.
   - Filter proximity (radius 100m dari sungai, radius 500m dari jalan).
   - Metrik luas area terdampak.
4. **Fire Intelligence:**
   - Modul khusus titik panas (hotspot) dan kluster kebakaran.
   - Fire Radiative Power (FRP), suhu kecerahan, satelit pendeteksi (VIIRS/MODIS).
   - Integrasi data cuaca publik BMKG/Open-Meteo (curah hujan, suhu, kelembaban, angin).
5. **OSINT Intelligence:**
   - Feed berita lokal publik & lembaran publikasi daerah (JDIH Sintang).
   - Tagging lokasi otomatis (Kecamatan Sintang, Ambalau, Serawai, Kayan Hilir, dll.).
   - Korelasi silang ke kejadian spasial terdekat.
6. **Event Registry:**
   - Tabel direktori seluruh kejadian intelijen (`intelligence_events`).
   - Filter status, taksonomi (`Observation`, `Detection`, `Correlation`, dll.), dan tingkat keyakinan (*confidence*).
   - Detail *Deep-Dive Modal* dengan inspeksi relasi.
7. **Timeline:**
   - Garis waktu kronologis interaktif kejadian dari waktu ke waktu di KPH Sintang Timur.
   - visualisasi perkembangan kluster kejadian.
8. **Data Sources & Provenance:**
   - Katalog 100% data publik yang dipakai.
   - Tabel audit trail pengambilan data, checksum hash SHA-256, status sinkronisasi, dan lisensi.
9. **Executive Reports & Briefing:**
   - Dokumen Daily Intelligence Briefing, Weekly Situational Assessment, dan Monthly Trend Report.
   - Sintesis berbasis bukti (*evidence-based*) yang dapat diunduh/diekspor (Markdown/PDF).
10. **System Health & Ingestion Monitor:**
    - Indikator kesehatan API penarik data publik.
    - Metrik utilisasi database spasial, status sinkronisasi satelit NASA FIRMS, dan log anomali koneksi.

---

## M. ROADMAP IMPLEMENTASI (FASE 2 SAMPAI FASE 8)

| Fase | Fokus Utama | Luaran Kunci |
|---|---|---|
| **Fase 2** | **Scaffolding Core & Ingestion Framework** | Penyiapan backend Express + TypeScript, skema basis data PostgreSQL/PostGIS, modul hashing checksum SHA-256, dan konektor data publik (NASA FIRMS & BBox Sintang). |
| **Fase 3** | **GIS Spatial Engine & Spatial Data Loader** | Ingestion batas wilayah publik KPH Sintang Timur, fungsi kawasan hutan (HL, HPT, HP), koridor hidrologi sungai Kapuas/Melawi, jalan, dan layer gambut KHG. |
| **Fase 4** | **Spatial Correlation & Event Processing Engine** | Implementasi algoritma DBSCAN untuk pengelompokan hotspot menjadi Fire Event, kalkulasi buffer jalan/sungai, dan mesin korelasi taksonomi 5-tahap. |
| **Fase 5** | **OSINT Ingestion & Cross-Reference Linker** | Integrasi parser feed berita daerah Kalbar/Sintang, JDIH publik, ekstraksi entitas geografis, dan penautan spasial terhadap polygon KPH. |
| **Fase 6** | **Frontend Web GIS Dashboard & MapLibre Viewer** | Pembangunan UI responsif modern: Peta interaktif MapLibre GL, layer switcher, event popups, dashboard eksekutif, dan penampil jejak sumber (*provenance viewer*). |
| **Fase 7** | **Grounded AI Briefing & Intelligence Reporting** | Integrasi Gemini API dengan guardrail ketat untuk menyusun Executive Daily/Weekly Briefing berbasis fakta PostGIS tanpa halusinasi. |
| **Fase 8** | **Audit, Quality Assurance, Resilience & Production Hardening** | Pengujian integritas data, stress test rendering ribuan titik spasial, verifikasi ketat klausul "Data tidak tersedia", dan audit kepatuhan data publik 100%. |
