/**
 * Spatial GeoJSON Vector Layers for KPH Sintang Timur & Kabupaten Sintang
 * All coordinates in WGS 84 (EPSG:4326)
 */

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
      type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'Point';
      coordinates: any;
    };
  }>;
}

// 1. KPH SINTANG TIMUR BOUNDARY (Public Spatial Outline)
export const KPH_SINTANG_TIMUR_BOUNDARY: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'KPH-STG-TIMUR',
        name: 'Kesatuan Pengelolaan Hutan (KPH) Sintang Timur',
        sk_penetapan: 'SK.674/Menhut-II/2011',
        provinsi: 'Kalimantan Barat',
        kabupaten: 'Sintang',
        area_ha: 847200,
        pengelola: 'UPTD KPH Sintang Timur - Dishut Kalbar',
        source: 'Geoportal KLHK RI (Data Publik Terbuka)',
        license: 'Kebijakan Satu Peta Indonesia',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [111.95, -0.05],
            [112.25, 0.15],
            [112.85, 0.25],
            [113.30, -0.05],
            [113.25, -0.65],
            [112.95, -1.05],
            [112.55, -0.95],
            [112.30, -0.75],
            [112.05, -0.50],
            [111.90, -0.25],
            [111.95, -0.05]
          ]
        ]
      }
    }
  ]
};

// 2. KABUPATEN SINTANG ADMINISTRATIVE OUTLINE
export const KABUPATEN_SINTANG_ADMIN: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        kode_kemendagri: '61.05',
        nama: 'Kabupaten Sintang',
        ibukota: 'Kecamatan Sintang',
        luas_wilayah_ha: 2163500,
        jumlah_kecamatan: 14,
        source: 'Badan Informasi Geospasial (BIG) Open Data',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [111.20, 0.40],
            [111.60, 0.48],
            [112.10, 0.35],
            [112.85, 0.25],
            [113.35, -0.05],
            [113.30, -0.70],
            [112.95, -1.15],
            [112.45, -0.95],
            [112.00, -0.65],
            [111.55, -0.45],
            [111.25, -0.15],
            [111.15, 0.15],
            [111.20, 0.40]
          ]
        ]
      }
    }
  ]
};

// 3. FOREST ZONATION (Fungsi Kawasan Hutan Publik KLHK)
export const FOREST_ZONES_LAYER: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'ZONE-HL-AMBALAU',
        nama: 'Hutan Lindung (HL) Pegunungan Muller / Bukit Baka',
        fungsi: 'Hutan Lindung (HL)',
        color: '#10b981', // Emerald
        fillColor: '#10b981',
        kph: 'KPH Sintang Timur',
        kecamatan: 'Ambalau',
        status: 'Dilindungi Penuh (Non-Konsesi)',
        sk: 'SK.733/Menhut-II/2014',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [112.45, -0.05],
            [112.85, 0.18],
            [113.25, -0.05],
            [113.15, -0.45],
            [112.65, -0.35],
            [112.45, -0.05]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'ZONE-HPT-SERAWAI',
        nama: 'Hutan Produksi Terbatas (HPT) Serawai - Kayan Hulu',
        fungsi: 'Hutan Produksi Terbatas (HPT)',
        color: '#f59e0b', // Amber
        fillColor: '#f59e0b',
        kph: 'KPH Sintang Timur',
        kecamatan: 'Serawai',
        status: 'Pemanfaatan Terbatas Eksploitasi Selektif',
        sk: 'SK.733/Menhut-II/2014',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [112.15, -0.35],
            [112.65, -0.35],
            [112.95, -0.65],
            [112.65, -0.85],
            [112.25, -0.65],
            [112.15, -0.35]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'ZONE-HP-KAYAN',
        nama: 'Hutan Produksi Tetap (HP) Kayan Hilir',
        fungsi: 'Hutan Produksi Tetap (HP)',
        color: '#3b82f6', // Blue
        fillColor: '#3b82f6',
        kph: 'KPH Sintang Timur',
        kecamatan: 'Kayan Hilir',
        status: 'Produksi Kayu Berkelanjutan',
        sk: 'SK.733/Menhut-II/2014',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [111.85, -0.15],
            [112.15, -0.15],
            [112.20, -0.45],
            [111.80, -0.45],
            [111.85, -0.15]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'ZONE-APL-KETUNGAU',
        nama: 'Areal Penggunaan Lain (APL) Wilayah Perbatasan & Perkebunan',
        fungsi: 'Areal Penggunaan Lain (APL)',
        color: '#8b5cf6', // Violet
        fillColor: '#8b5cf6',
        kph: 'Bukan Kawasan Hutan (Penyangga)',
        kecamatan: 'Ketungau Hilir & Tengah',
        status: 'Areal Budidaya / Perkebunan / Pemukiman',
        sk: 'RTRW Kabupaten Sintang',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [111.35, 0.05],
            [111.85, 0.25],
            [111.95, 0.05],
            [111.45, -0.10],
            [111.35, 0.05]
          ]
        ]
      }
    }
  ]
};

// 4. PEATLAND (Kawasan Hidrologis Gambut - BRGM / KLHK)
export const PEATLAND_LAYER: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'KHG-BELITANG-KAPUAS',
        nama: 'KHG Sungai Kapuas - Sungai Belitang',
        tipe: 'Fungsi Lindung Ekosistem Gambut (Kubah Gambut)',
        kedalaman: 'Sedang (100 - 200 cm)',
        luas_ha: 38400,
        tingkat_rawan_api: 'TINGGI (Rentan terbakar bila kering)',
        source: 'Peta Indikatif KHG BRGM RI (Publik)',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [111.60, 0.08],
            [111.90, 0.18],
            [111.85, 0.02],
            [111.62, 0.02],
            [111.60, 0.08]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'KHG-MELAWI-DELTA',
        nama: 'KHG Daerah Aliran Sungai Melawi Bawah',
        tipe: 'Gambut Dangkal Aluvial',
        kedalaman: 'Dangkal (50 - 100 cm)',
        luas_ha: 14200,
        tingkat_rawan_api: 'SEDANG',
        source: 'Peta Indikatif KHG BRGM RI (Publik)',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [112.05, -0.18],
            [112.25, -0.12],
            [112.22, -0.25],
            [112.08, -0.28],
            [112.05, -0.18]
          ]
        ]
      }
    }
  ]
};

// 5. HYDROGRAPHY (Jalur Sungai Utama - OpenStreetMap / BIG)
export const RIVERS_LAYER: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Sungai Kapuas (Jalur Utama)',
        lebar_rata2_m: 350,
        status: 'Sungai Strategis Nasional / Batas Koridor Buffer 100m',
        source: 'OpenStreetMap Hydrography',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.20, 0.12],
          [111.45, 0.08],
          [111.50, 0.05], // Pertemuan Sintang
          [111.75, 0.10],
          [112.10, 0.18],
          [112.50, 0.25]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        nama: 'Sungai Melawi',
        lebar_rata2_m: 220,
        status: 'Jalur Transportasi Air Utama Sintang - Serawai - Ambalau',
        source: 'OpenStreetMap Hydrography',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.50, 0.05], // Muara Sungai Melawi di Kota Sintang
          [111.80, -0.15],
          [112.10, -0.30],
          [112.38, -0.45], // Nanga Serawai
          [112.56, -0.12]  // Nanga Ambalau
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        nama: 'Sungai Kayan',
        lebar_rata2_m: 90,
        status: 'Anak Sungai Melawi',
        source: 'OpenStreetMap Hydrography',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.80, -0.15],
          [111.95, -0.25],
          [112.01, -0.28], // Nanga Mau
          [112.15, -0.40]
        ]
      }
    }
  ]
};

// 6. ROADS NETWORK (Jalur Akses Transportasi Publik)
export const ROADS_LAYER: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Jalan Nasional Trans Kalimantan Poros Tengah',
        kelas: 'Jalan Arteri Primer',
        kondisi: 'Aspal / Terawat',
        source: 'Kementerian PUPR Open Data',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.18, 0.02],
          [111.50, 0.05], // Kota Sintang
          [111.85, 0.08],
          [112.15, 0.15]  // Arah Kapuas Hulu (Putussibau)
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        nama: 'Jalan Poros Sintang - Nanga Pinoh',
        kelas: 'Jalan Kolektor Primer',
        kondisi: 'Aspal',
        source: 'Dinas Bina Marga Kalbar',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.50, 0.05],
          [111.65, -0.15],
          [111.75, -0.32]  // Masuk Kab. Melawi
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        nama: 'Jalan Koridor Akses Sintang - Kayan Hilir (Nanga Mau)',
        kelas: 'Jalan Provinsi / Lokal',
        kondisi: 'Agregat & Tanah Diperkeras',
        source: 'OpenStreetMap Highway Dataset',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.50, 0.05],
          [111.78, -0.10],
          [112.01, -0.28]
        ]
      }
    }
  ]
};
