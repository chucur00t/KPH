/**
 * KPH INTELLIGENCE - PUBLIC AUTHORIZATION CORRELATION SERVICE (PHASE 10)
 * Evaluates spatial relationship between activity indicators and public concessions/permits.
 * STRICT LEGAL SAFETY RULE:
 * OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA does NOT mean ILLEGAL.
 * It means: "No matching public authorization record found in published registry. Legal status requires verification."
 */

import fs from 'fs';
import path from 'path';
import {
  PublicAuthorizationRecord,
  AuthorizationSpatialStatus,
  LegalStatus,
} from '../../types/forestryActivity';

export interface AuthorizationEvaluationResult {
  status: AuthorizationSpatialStatus;
  matchingRecord?: PublicAuthorizationRecord;
  overlapPercentage: number;
  notes: string;
  suggestedLegalStatus: LegalStatus;
  legalStatusReason: string;
}

export class ForestryAuthorizationCorrelationService {
  private static authorizationsCache: PublicAuthorizationRecord[] = [];

  public static getPublicAuthorizations(): PublicAuthorizationRecord[] {
    if (this.authorizationsCache.length > 0) {
      return this.authorizationsCache;
    }

    try {
      const filePath = path.join(process.cwd(), 'data', 'public_authorizations.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        this.authorizationsCache = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not load public authorizations cache:', e);
      this.authorizationsCache = [];
    }

    return this.authorizationsCache;
  }

  /**
   * Evaluates an activity centroid against public authorization polygons.
   */
  public static evaluateLocation(point: [number, number]): AuthorizationEvaluationResult {
    const records = this.getPublicAuthorizations();
    const [lon, lat] = point;

    for (const record of records) {
      if (record.geometry && record.geometry.coordinates) {
        if (this.isPointInPolygon(point, record.geometry.coordinates[0])) {
          return {
            status: 'WITHIN_PUBLIC_AUTHORIZED_AREA',
            matchingRecord: record,
            overlapPercentage: 100.0,
            notes: `Berada di dalam konsesi publik terdaftar: ${record.holderName} (${record.permitType} ${record.decreeNumber}).`,
            suggestedLegalStatus: 'PUBLIC_AUTHORIZATION_RECORD_FOUND',
            legalStatusReason: `Terdapat catatan perizinan publik resmi (${record.permitType}) dari ${record.sourceAgency}. Kegiatan operasional memerlukan pengecekan RKT/Rencana Kerja Tahunan.`,
          };
        }
      }
    }

    // Proximity check: is it close to any concession boundary (e.g. within ~1.5 km)?
    for (const record of records) {
      const [cLon, cLat] = record.centroid;
      const distKm = this.haversineDistanceKm(lat, lon, cLat, cLon);
      if (distKm <= 8.0) {
        return {
          status: 'PARTIALLY_OVERLAPS_PUBLIC_AUTHORIZED_AREA',
          matchingRecord: record,
          overlapPercentage: 45.0,
          notes: `Berada di sekitar atau koridor batas terluar konsesi publik: ${record.holderName}.`,
          suggestedLegalStatus: 'PUBLIC_AUTHORIZATION_RECORD_FOUND',
          legalStatusReason: `Bukaan vegetasi berada di sekitar koridor konsesi resmi ${record.holderName}; verifikasi diperlukan untuk memastikan batas kerja operasional.`,
        };
      }
    }

    // Not inside any known public concession record
    return {
      status: 'OUTSIDE_KNOWN_PUBLIC_AUTHORIZED_AREA',
      overlapPercentage: 0.0,
      notes: 'Tidak ditemukan catatan perizinan atau hak konsesi dalam katalog data spasial publik terbuka.',
      suggestedLegalStatus: 'REQUIRES_VERIFICATION',
      legalStatusReason: 'Ketiadaan catatan izin publik BUKAN bukti tindakan ilegal. Data publik mungkin belum terdigitasi lengkap atau kegiatan merupakan hak tradisional masyarakat yang memerlukan verifikasi.',
    };
  }

  private static isPointInPolygon(point: [number, number], ring: [number, number][]): boolean {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private static haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
