# FORESTRY ACTIVITY VALIDATION & FALSE POSITIVE MANAGEMENT (PHASE 10)
**Protokol Validasi & Manajemen False Positive**

Dalam pengamatan satelit dan penginderaan jauh, tidak semua anomali spektral mencerminkan aktivitas ilegal. Sistem secara aktif mengelola potensi **False Positive** melalui taksonomi penyebab yang transparan:

---

## 1. Taksonomi Penyebab False Positive (Section 29)
1. `CLOUD_OR_HAZE_ARTIFACT`: Bayangan awan tebal atau kabut asap yang menyebabkan penurunan semu nilai reflektansi optik.
2. `SEASONAL_AGRICULTURE_CYCLE`: Siklus gilir balik ladang tradisional masyarakat setempat yang bukan merupakan perambahan hutan permanen.
3. `LEGAL_HARVESTING_AUTHORIZED`: Pemanenan kayu legal sesuai blok RKT (Rencana Kerja Tahunan) pemegang izin IUPHHK yang sah.
4. `PLANTATION_MAINTENANCE`: Pembersihan gulma atau penanaman kembali (replanting) legal di areal HGU yang sah.
5. `NATURAL_DISTURBANCE_TREEFALL_FLOOD`: Gangguan alami seperti pohon tumbang massal akibat angin puting beliung atau luapan banjir hulu.
6. `RIVER_BANK_EROSION_OR_MOVEMENT`: Erosi atau pergeseran bantaran sungai alami.
7. `PERMITTED_INFRASTRUCTURE_WORK`: Pembangunan jalan umum atau jembatan yang telah mengantongi Persetujuan Penggunaan Kawasan Hutan (PPKH).
8. `SENSOR_CALIBRATION_DIFFERENCE`: Perbedaan sudut pandang nadir satelit atau kalibrasi sensor antar overpass.

---

## 2. Alur Peninjauan (Review Workflow)
Setiap indikator memiliki status verifikasi yang dapat diaudit:
- `DETECTED`: Indikator baru terdeteksi oleh algoritma.
- `REVIEW_REQUIRED`: Butuh penelaahan dokumen izin dan citra lanjutan.
- `SUPPORTED_BY_MULTIPLE_SOURCES`: Terkonfirmasi oleh >= 3 sensor/sumber data independen.
- `CONFIRMED_BY_PUBLIC_SOURCE`: Dikonfirmasi oleh rilis instansi penegak hukum resmi.
- `DISMISSED`: Ditandai sebagai False Positive dan dikecualikan dari status peringatan darurat.
