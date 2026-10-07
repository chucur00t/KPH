# FORESTRY ACTIVITY TAXONOMY (PHASE 10)
**Taksonomi Baku Indikator Gangguan Kawasan Hutan**

Sistem menerapkan taksonomi terstandarisasi untuk mengklasifikasikan indikator aktivitas tanpa prasangka hukum otomatis:

---

## 1. FOREST_DISTURBANCE
- **Definisi:** Penurunan tutupan vegetasi hutan secara umum akibat faktor antropogenik atau gangguan alami.
- **Indikator:** Penurunan dNDVI drastis (> 0.25), pengurangan kanopi optik, fragmentasi tajuk pohon.
- **Sensor Bukti:** Sentinel-2 MSI L2A, Landsat-9 OLI-2, Sentinel-1 SAR.

---

## 2. POTENTIAL_LOGGING
- **Definisi:** Indikator spasial pembukaan tajuk pohon lokal yang membentuk pola ekstraksi kayu.
- **Indikator:** Bukaan bercak kanopi kecil berulang, jalur rintisan (skid roads), konsentrasi bukaan di dekat sempadan sungai (sarana rakit kayu) atau jalan logistik.
- **Terminologi Wajib:** `potential_logging_indicator`. Dilarang menyatakan "pembalakan liar terkonfirmasi" tanpa putusan otoritas berwenang.

---

## 3. POTENTIAL_LAND_CLEARING
- **Definisi:** Pembersihan lahan vegetasi dalam luasan signifikan untuk persiapan penggunaan non-kehutanan.
- **Indikator:** Penurunan tajam dNDVI dan dNBR, konversi tutupan lahan, pembukaan vegetasi berulang, korelasi dengan titik api pembersihan.

---

## 4. POTENTIAL_ENCROACHMENT
- **Definisi:** Indikator perambahan atau perluasan aktivitas dari areal luar menyeberangi batas kawasan hutan negara.
- **Indikator:** Bukaan vegetasi yang beririsan dengan batas kawasan hutan (HL/HPT/HP), ekspansi dari pemukiman/ladang eksisting, jarak <= 200 meter dari garis batas kawasan.
- **Pengukuran Wajib:** `distance_to_forest_boundary` dan `forest_overlap_percentage`.

---

## 5. POTENTIAL_MINING
- **Definisi:** Indikator aktivitas galian atau penambangan tanpa izin resmi di bantaran sungai atau kawasan hutan.
- **Indikator:** Bukaan lahan bantaran, kolam sedimen, anomali kekeruhan air aliran sungai, rilis penertiban PETI oleh aparat kepolisian/Gakkum.
- **Status Hukum:** `REQUIRES_VERIFICATION` atau `PUBLIC_ENFORCEMENT_REPORTED`.

---

## 6. POTENTIAL_PLANTATION_EXPANSION
- **Definisi:** Indikator pembukaan lahan dengan pola geometris teratur khas perkebunan monokultur (misal kelapa sawit).
- **Indikator:** Pola blok pembersihan teratur, drainase parit linier di atas lahan gambut, ekspansi dari kebun eksisting.

---

## 7. POTENTIAL_ROAD_CONSTRUCTION
- **Definisi:** Deteksi koridor bukaan vegetasi linier memanjang menembus kawasan hutan.
- **Indikator:** Lebar bukaan 15-30 meter memanjang ratusan hingga ribuan meter menembus tutupan kanopi hutan primer/sekunder.
- **Korelasi Izin:** Evaluasi apakah koridor berada di dalam RKT IUPHHK yang sah atau koridor liar tak berizin.

---

## 8. POTENTIAL_FOREST_FIRE_ACTIVITY
- **Definisi:** Aktivitas kebakaran hutan atau pembakaran yang berhimpitan waktu dan ruang dengan perubahan tutupan lahan.
- **Indikator:** DBSCAN spatiotemporal cluster hotspot VIIRS/MODIS + dNDVI drop pada jeda 0 - 30 hari.
