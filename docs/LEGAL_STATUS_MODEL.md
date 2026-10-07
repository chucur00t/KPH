# LEGAL STATUS MODEL (PHASE 10)
**Model Status Hukum Independen & Pemisahan Makna Legalitas**

Sistem menerapkan model pemisahan status legalitas secara terpisah dari observasi fisik:

---

## 1. Nilai Status Hukum Baku (Controlled Legal Status)

| STATUS | ARTI OPERASIONAL | TINDAKAN SISTEM |
|---|---|---|
| `UNKNOWN` | Status hukum tidak dapat ditentukan dari data yang tersedia | Pertahankan netralitas, rekomendasikan pengecekan dokumen |
| `NOT_ASSESSED` | Belum dilakukan telaah spasial terhadap data perizinan publik | Jalankan modul korelasi perizinan |
| `PUBLIC_LICENSE_RECORD_FOUND` | Ditemukan catatan izin pemanfaatan hutan (IUPHHK) atau HGU resmi | Periksa kesesuaian RKT / Rencana Kerja Tahunan |
| `PUBLIC_AUTHORIZATION_RECORD_FOUND` | Terdapat penetapan perhutanan sosial / izin penggunaan kawasan | Catat SK menteri dan pemegang hak kelola |
| `PUBLIC_RESTRICTION_RECORD_FOUND` | Wilayah memiliki larangan tegas (misal Hutan Lindung, Moratorium Gambut) | Naikkan prioritas verifikasi jika terjadi bukaan |
| `PUBLIC_VIOLATION_REPORTED` | Laporan publik atau pengaduan masyarakat telah diterbitkan terbuka | Beri label klaim publik tanpa vonis terbukti |
| `PUBLIC_ENFORCEMENT_REPORTED` | Aparat penegak hukum (Gakkum/Polri) telah menerbitkan rilis operasi | Cantumkan nomor perkara & kutipan siaran pers resmi |
| `PUBLIC_COURT_CASE_REPORTED` | Terdapat perkara teregistrasi di SIPP Pengadilan Negeri Sintang | Tautkan nomor perkara peradilan |
| `PUBLIC_LEGAL_FINDING_AVAILABLE` | Telah terdapat putusan berkekuatan hukum tetap (inkracht) | Cantumkan amar putusan publik |
| `REQUIRES_VERIFICATION` | Ketiadaan izin publik membutuhkan konfirmasi fisik | Rekomendasikan jadwal patroli terpadu |

---

## 2. Aturan Kritis: Ketiadaan Izin Bukan Vonis Ilegal
Ketiadaan data izin publik terbuka (`OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA`):
- **BUKAN BERARTI:** "Aktivitas Ilegal" atau "Pembalakan Liar".
- **ARTI SEBENARNYA:** "Catatan izin publik tidak ditemukan dalam katalog terbuka saat ini. Status hukum belum dapat dipastikan dan memerlukan verifikasi."

Alasan mengapa izin mungkin tidak ada di data publik:
1. Peta perizinan kementerian belum diperbarui pada siklus rilis terbaru.
2. Kegiatan merupakan hak tradisional masyarakat adat setempat yang diakui perda kabupaten namun belum terdigitasi dalam geoportal nasional.
3. Dokumen izin bersifat sah secara fisik namun belum terunggah ke basis data spasial publik.
