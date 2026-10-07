# FORESTRY ACTIVITY DATA SOURCES (PHASE 10)
**Katalog Sumber Data Terbuka untuk Deteksi Aktivitas Kehutanan**

Seluruh data yang digunakan dalam Modul Fase 10 bersumber 100% dari portal data publik terbuka yang sah secara hukum:

---

## 1. Sumber Data Satelit (Remote Sensing)
1. **Copernicus Sentinel-2 MSI Level-2A (ESA / Uni Eropa):**
   - *Data:* Citra multispektral 10m - 20m Bottom-Of-Atmosphere (BOA).
   - *Kegunaan:* Deteksi penurunan kanopi (dNDVI), jalur koridor linier rintisan, dan perubahan bi-temporal.
   - *Akses:* STAC Catalog API `catalogue.dataspace.copernicus.eu`.
2. **NASA FIRMS VIIRS & MODIS (NASA LANCE EOSDIS):**
   - *Data:* Titik anomali termal 375m NRT dan Fire Radiative Power (FRP).
   - *Kegunaan:* Deteksi pembakaran lahan berulang dan korelasi pembukaan hutan dengan api.
   - *Akses:* `firms.modaps.eosdis.nasa.gov`.
3. **USGS Landsat 9 OLI-2 (USGS / NASA):**
   - *Data:* Citra optik 30m Level-2 Surface Reflectance.
   - *Kegunaan:* Baseline tutupan hutan historis multi-dekade.

---

## 2. Sumber Data Geoportal Pemerintah RI
1. **Geoportal Kementerian Lingkungan Hidup dan Kehutanan (KLHK):**
   - *Data:* Peta Kawasan Hutan SK.733/Menhut-II/2014, Peta Izin Usaha Pemanfaatan Hasil Hutan (IUPHHK-HA/HT), Peta Hutan Desa/Perhutanan Sosial.
   - *Akses:* `geoportal.menlhk.go.id/arcgis/rest/services/KLHK`.
2. **Badan Restorasi Gambut dan Mangrove (BRGM RI):**
   - *Data:* Peta Indikatif Kesatuan Hidrologis Gambut (KHG) Belitang & Kapuas.
   - *Akses:* PRIMS BRGM `prims.brgm.go.id`.
3. **Kementerian ATR / BPN (Portal Bhumi):**
   - *Data:* Peta Hak Guna Usaha (HGU) Perkebunan publik terbuka.
   - *Akses:* `bhumi.atrbpn.go.id`.

---

## 3. Sumber Data Penegakan Hukum & Pemberitaan Publik
1. **Siaran Pers Resmi Balai Gakkum KLHK Wilayah Kalimantan:**
   - *Data:* Rilis penindakan operasi pembalakan liar dan penyitaan kayu olahan tanpa dokumen SKSHH.
2. **LKBN ANTARA Biro Kalimantan Barat:**
   - *Data:* Pemberitaan jurnalistik terverifikasi mengenai operasi penertiban tambang emas tanpa izin (PETI) dan penegakan hukum lingkungan.
3. **Jaringan Dokumentasi dan Informasi Hukum (JDIH) Kabupaten Sintang:**
   - *Data:* Peraturan Bupati Sintang No. 42 terkait penanggulangan karhutla dan regulasi masyarakat hukum adat.
