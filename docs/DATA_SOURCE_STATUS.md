# DATA SOURCE STATUS & AUDIT REGISTRY
**KPH Public Intelligence System**  
**Target:** Kabupaten Sintang & KPH Sintang Timur, Kalimantan Barat  

---

## 1. Verified Public Data Sources

| Source ID | Provider | Category | Endpoint / Access | License | Freshness | Health Status |
|---|---|---|---|---|---|---|
| `SRC-NASA-FIRMS-VIIRS` | NASA LANCE FIRMS | Thermal Fire | `https://firms.modaps.eosdis.nasa.gov/api/area/` | Open Access (NASA Open Data) | FRESH (< 6h) | **HEALTHY** |
| `SRC-ESA-COPERNICUS-S2`| ESA Copernicus | Satellite Optical | `https://dataspace.copernicus.eu/stac/` | CC BY-SA 3.0 IGO | FRESH (< 24h) | **HEALTHY** |
| `SRC-KLHK-SIPONGI` | Ditjen PPI KLHK | Thermal Hotspot | `https://sipongi.menlhk.go.id/` | Informasi Publik Terbuka RI | FRESH (< 12h) | **HEALTHY** |
| `SRC-BMKG-WEATHER` | Stasiun Meteorologi Susilo | Weather Telemetry | `https://data.bmkg.go.id/` | Terbuka BMKG | FRESH (< 3h) | **HEALTHY** |
| `SRC-LKBN-ANTARA-KALBAR`| LKBN ANTARA | OSINT News | `https://kalbar.antaranews.com/rss/terkini.xml` | Hak Cipta Dilindungi Publik | FRESH (< 4h) | **HEALTHY** |
| `SRC-JDIH-KAB-SINTANG` | Bagian Hukum Setda Sintang | Regulasi & Warta | `https://jdih.sintang.go.id/` | Dokumen Publik Terbuka RI | FRESH (< 24h) | **HEALTHY** |
| `SRC-PEMKAB-SINTANG` | Prokopim Kab. Sintang | Portal Pemerintah | `https://sintang.go.id/` | Informasi Publik Daerah | FRESH (< 12h) | **HEALTHY** |
| `SRC-BIG-BATAS-RTRW` | Badan Informasi Geospasial | GIS Boundary | Ina-Geoportal WFS/GeoJSON | Kebijakan Satu Peta | STABLE | **HEALTHY** |
| `SRC-BRGM-GAMBUT` | BRGM Indonesia | Gambut KHG | Geoportal BRGM | Data Spasial Terbuka | STABLE | **HEALTHY** |

---

## 2. Fail-Safe Strategy

1. **If Satellite Offline:** Fire, OSINT, and GIS Boundary modules continue reporting without interruption.
2. **If Fire Feed Offline:** Satellite land change and OSINT modules remain fully operational.
3. **If Gemini API Offline:** Deterministic Grounded Engine automatically takes over generating factual daily briefings from PostGIS data.
