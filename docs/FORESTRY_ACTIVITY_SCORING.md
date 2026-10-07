# FORESTRY ACTIVITY SCORING (PHASE 10)
**Mesin Penilaian Skor Deterministik & Prioritas Verifikasi**

Sistem menerapkan algoritma pembobotan matematis murni (**Deterministic Backend Scoring Engine**) untuk menentukan tingkat urgensi investigasi lapangan.

**Model AI (Gemini Flash) DILARANG KERAS menghitung atau mengubah skor angka ini secara mandiri.**

---

## 1. Komponen Bobot Skor (Scoring Weights v1.0.0)

| KOMPONEN | BOBOT | PARAMETER EVALUASI |
|---|---|---|
| **Disturbance Magnitude** | 25% | Luasan bukaan (Ha) & magnitudo dNDVI drop (tingkat keparahan kanopi hilang) |
| **Spatial Sensitivity** | 20% | Fungsi kawasan (HL: 100, HPT: 75, HP: 60, APL: 35) + Bonus Gambut KHG (+20) |
| **Fire Correlation** | 15% | Kehadiran anomali termal VIIRS/MODIS (80 - 100) |
| **Road & River Proximity** | 15% | Jarak ke koridor air/jalan (<= 150m: 100, <= 500m: 70, <= 1000m: 40) |
| **OSINT Correlation** | 10% | Konfirmasi pemberitaan media publik atau rilis penertiban (85) |
| **Temporal Pattern** | 10% | Pola waktu (EXPANDING: 100, PERSISTENT: 85, NEW: 70, RECURRING: 65) |
| **Source Quality** | 5% | Jumlah sensor independen (>=4: 100, 3: 80, 2: 60, 1: 30) |

---

## 2. Tingkat Prioritas Aktivitas (Activity Priority)
- **HIGH (Tinggi):** Skor >= 80.0
- **MODERATE (Sedang):** Skor 60.0 - 79.9
- **LOW (Rendah):** Skor < 60.0

*Catatan Penting: Prioritas aktivitas adalah indikator urgensi analisis data, BUKAN probabilitas kejahatan hukum.*

---

## 3. Prioritas Verifikasi Lapangan (Verification Priority)
Faktor penentu verifikasi lapangan:
- **URGENT:** Skor >= 85 DAN berada di Hutan Lindung (HL) atau Gambut (KHG) DAN didukung korelasi api atau >= 3 sumber data.
- **HIGH:** Skor >= 70
- **MEDIUM:** Skor >= 45
- **LOW:** Skor < 45
