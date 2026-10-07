import { EvidenceBundle } from '../../types/intelligenceEngine';

export interface UncertaintyBreakdown {
  known: string[];
  unknown: string[];
  uncertain: string[];
  conflicting: string[];
  not_available: string[];
}

export class UncertaintyEngine {
  public static evaluate(bundle: EvidenceBundle): UncertaintyBreakdown {
    const fireCount = bundle.fire_hotspots.length;
    const landChangeCount = bundle.satellite_land_changes.length;

    return {
      known: [
        `Instrumen satelit Sentinel-2 mendeteksi ${landChangeCount} klaster anomali kerapatan kanopi (dNDVI) di Kabupaten Sintang.`,
        `Sensor VIIRS/MODIS mencatat ${fireCount} anomali termal radiatif publik pada wilayah koordinat terdata.`,
        `Yurisdiksi administrasi dan batas fungsi kawasan hutan (HL, HPT, HP) terkonfirmasi melalui Geoportal resmi Satu Data Kalbar.`,
      ],
      unknown: [
        'Penyebab spesifik penurunan tutupan tajuk pohon (apakah faktor tebang pilih, pembukaan ladang tradisional, atau defoliasi musiman).',
        'Kondisi riil material bahan bakar dan kelembaban gambut di kedalaman bawah permukaan tanah.',
      ],
      uncertain: [
        'Tingkat keterkaitan langsung antara anomali termal titik panas dengan kejadian nyala api terbuka di lantai hutan.',
        'Durasi tepat terjadinya perubahan tutupan vegetasi di antara tanggal revisit orbit Sentinel-2 (5 hari).',
      ],
      conflicting: [
        'Perbedaan waktu pelaporan siaran pers media lokal dibanding waktu lintasan orbit satelit (time lag ~24-48 jam).',
      ],
      not_available: [
        'Data patroli verifikasi lapangan internal petugas (kepatuhan mutlak prinsip 100% data publik).',
        'Data identitas kepemilikan/penguasaan lahan privat mikro atau batas perladangan perseorangan.',
      ],
    };
  }
}
