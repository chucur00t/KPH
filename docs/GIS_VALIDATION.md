# GIS & POSTGIS VALIDATION REPORT
**KPH Public Intelligence System**  
**Spatial Reference System:** WGS 84 (EPSG:4326) & Web Mercator (EPSG:3857)  
**Target AOI:** Bounding Box [111.15, -1.15, 113.35, 0.05] (Kabupaten Sintang & KPH Sintang Timur)  

---

## 1. Geodesic & Computational Geometry Verification

1. **Haversine Distance (IUGG Mean Earth Radius 6,371,008.8m):**
   - Sintang to Nanga Pinoh distance validated at ~42 km.
   - Segment point-to-line projection validated for river buffer (100m) and road buffer (500m).
2. **Geodesic Area Calculation:**
   - KPH Sintang Timur polygon area validated at ~847,200 Hectares.
   - Ambalau canopy disturbance polygon area validated at 14.8 Hectares.
3. **Point in Polygon (Ray Casting with Hole Handling):**
   - Valid coordinates in Ambalau `[-0.125, 112.565]` yield `TRUE` within KPH Sintang Timur boundary.
   - Out-of-bounds coordinates (Pontianak `[-0.03, 109.33]`) yield `FALSE`.
4. **Bounding Box Intersection:**
   - Evaluates fast spatial overlap before intensive ray-casting.
5. **Geometry Validation Rules:**
   - Non-finite numbers (`NaN`, `Infinity`) rejected with `GEOMETRY_INVALID`.
   - Longitude outside `[-180, 180]` or Latitude outside `[-90, 90]` rejected.
   - Polygon outer ring must have >= 4 coordinates and be closed.
