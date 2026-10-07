# ILLEGAL FORESTRY ACTIVITY INTELLIGENCE (PHASE 10)
**Kesatuan Pengelolaan Hutan (KPH) Sintang Timur, Kabupaten Sintang, Kalimantan Barat**

## 1. Tujuan & Ruang Lingkup
Modul **Illegal Forestry Activity Intelligence** dirancang untuk mengidentifikasi, memantau, mengkorelasikan, dan memprioritaskan indikator publik dari aktivitas kehutanan yang berpotensi menyimpang atau tidak sah.

Sistem ini **TIDAK PERNAH** secara otomatis menyimpulkan atau menuduh bahwa suatu aktivitas adalah ilegal atau merupakan tindak pidana.

### Alur Berjenjang (Hierarchical Intelligence Pipeline):
```text
OBSERVATION (Pengamatan Satelit / Sensor Termal / WFS Geoportal)
    ↓
INDICATOR (Indikator Bukaan Kanopi / Koridor Linier / Anomali Termal)
    ↓
SPATIAL/TEMPORAL CORRELATION (Irisan Fungsi Hutan / Jarak Sungai & Jalan / Cuaca)
    ↓
POTENTIAL ACTIVITY (Potensi Aktivitas: Logging / Clearing / Mining / Road)
    ↓
INTELLIGENCE ASSESSMENT (Skor Prioritas & Analisis Fakta Berbasis Bukti)
    ↓
REQUIRES VERIFICATION (Rekomendasi Ground Patrol Lapangan Resmi)
```

DILARANG KERAS ALUR:
```text
PUBLIC DATA → AI GUESS → ILLEGAL ACCUSATION
```

---

## 2. Prinsip Data 100% Publik
Sistem beroperasi di bawah batasan hukum dan privasi ketat:
1. **Hanya Menggunakan Data Terbuka:**
   - Citra satelit Sentinel-1, Sentinel-2 L2A BOA, USGS Landsat-8/9
   - Data titik panas termal NASA FIRMS VIIRS & SIPONGI KLHK
   - Batas kawasan hutan Geoportal KLHK (HL, HPT, HP, KSA, APL)
   - Peta indikatif Kesatuan Hidrologis Gambut (KHG) BRGM RI
   - Data izin konsesi & HGU yang dipublikasikan secara terbuka
   - Rilis penegakan hukum resmi (Gakkum KLHK, Kepolisian, Direktori Putusan Pengadilan)
   - Pemberitaan media pers resmi (LKBN ANTARA, Pemkab Sintang, JDIH)
2. **Nol Akses Data Rahasia:**
   - Tidak menggunakan database internal KPH rahasia
   - Tidak menggunakan data SMART Patrol privat tanpa izin rilis
   - Tidak menggunakan grup percakapan WhatsApp/Telegram privat
   - Tidak melakukan profiling individu atau warga sipil privat.

---

## 3. Pemisahan Dua Dimensi (Activity vs Legal Status)
Sistem memisahkan secara independen antara:
1. **Dimensi Aktivitas Fisik (Physical Activity):** Bukaan kanopi sekian hektar, anomali termal radiasi MW, jarak ke sempadan sungai.
2. **Dimensi Status Legalitas (Legal Status):** Menunjukkan apakah terdapat catatan perizinan publik terbuka atau tindakan penegakan hukum resmi.

Ketiadaan catatan izin dalam portal publik terbuka **BUKAN BUKTI** bahwa suatu kegiatan adalah ilegal. Hal tersebut diartikan sebagai `PUBLIC_STATUS_NOT_ESTABLISHED` atau `REQUIRES_VERIFICATION`.
