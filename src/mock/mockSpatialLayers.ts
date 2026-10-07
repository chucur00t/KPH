/**
 * [MOCK SPATIAL LAYERS - UI DEVELOPMENT ONLY / FASE 2]
 * Vector GeoJSON layers for KPH Sintang Timur & Kabupaten Sintang
 */

import { GeoJsonFeatureCollection } from '../types';

export const MOCK_KPH_BOUNDARY: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'KPH-STG-TIMUR',
        name: 'KPH Sintang Timur [MOCK OUTLINE]',
        sk_penetapan: 'SK.674/Menhut-II/2011',
        provinsi: 'Kalimantan Barat',
        kabupaten: 'Sintang',
        area_ha: 847200,
        source: 'Geoportal KLHK RI (Public Open Data)',
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

export const MOCK_KABUPATEN_ADMIN: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Kabupaten Sintang [MOCK ADMIN]',
        luas_wilayah_ha: 2163500,
        jumlah_kecamatan: 14,
        source: 'Badan Informasi Geospasial (BIG)',
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

export const MOCK_FOREST_ZONES: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Hutan Lindung (HL) Ambalau / Bukit Baka',
        fungsi: 'Hutan Lindung (HL)',
        color: '#10b981',
        status: 'Dilindungi Penuh (Non-Konsesi)',
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
        nama: 'Hutan Produksi Terbatas (HPT) Serawai',
        fungsi: 'Hutan Produksi Terbatas (HPT)',
        color: '#f59e0b',
        status: 'Pemanfaatan Terbatas Eksploitasi Selektif',
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
        nama: 'Hutan Produksi Tetap (HP) Kayan Hilir',
        fungsi: 'Hutan Produksi Tetap (HP)',
        color: '#3b82f6',
        status: 'Produksi Kayu Berkelanjutan',
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
        nama: 'Areal Penggunaan Lain (APL) Ketungau',
        fungsi: 'Areal Penggunaan Lain (APL)',
        color: '#8b5cf6',
        status: 'Areal Budidaya / Perkebunan / Pemukiman',
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

export const MOCK_PEATLAND: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'KHG Sungai Kapuas - Sungai Belitang',
        tipe: 'Kubah Gambut Lindung',
        kedalaman: '100 - 200 cm (Sedang)',
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
    }
  ]
};

export const MOCK_RIVERS: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Sungai Kapuas & Melawi',
        lebar: '220 - 350 m',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.20, 0.12],
          [111.50, 0.05],
          [111.80, -0.15],
          [112.10, -0.30],
          [112.38, -0.45],
          [112.56, -0.12]
        ]
      }
    }
  ]
};

export const MOCK_ROADS: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        nama: 'Jalan Nasional Trans Kalimantan Poros Tengah',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [111.18, 0.02],
          [111.50, 0.05],
          [111.85, 0.08],
          [112.15, 0.15]
        ]
      }
    }
  ]
};
