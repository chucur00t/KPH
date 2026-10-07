/**
 * Geospatial Engine Service for KPH Intelligence
 * Rigorous Geodesic & Planar Computational Geometry algorithms
 * Coordinate Reference System: WGS 84 (EPSG:4326)
 */

export class SpatialEngineService {
  private static readonly EARTH_RADIUS_METERS = 6371008.8; // Mean Earth Radius (IUGG)

  /**
   * Geodesic Distance between two coordinates in meters (Haversine Formula)
   */
  public static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_METERS * c;
  }

  /**
   * Minimum Geodesic Distance from a point to a LineString in meters.
   * Tests both vertex distances and perpendicular projections onto each line segment.
   */
  public static pointToLineDistanceMeters(
    lat: number,
    lon: number,
    lineCoordinates: Array<[number, number]>
  ): { distanceMeters: number; nearestPoint: [number, number] } {
    if (lineCoordinates.length === 0) {
      return { distanceMeters: Infinity, nearestPoint: [lon, lat] };
    }
    if (lineCoordinates.length === 1) {
      const [pLon, pLat] = lineCoordinates[0];
      return {
        distanceMeters: this.haversineDistance(lat, lon, pLat, pLon),
        nearestPoint: [pLon, pLat],
      };
    }

    let minDistance = Infinity;
    let closestPoint: [number, number] = lineCoordinates[0];

    for (let i = 0; i < lineCoordinates.length - 1; i++) {
      const [lonA, latA] = lineCoordinates[i];
      const [lonB, latB] = lineCoordinates[i + 1];

      // Approximate flat projection for local segment segment (valid within local km scale)
      const cosLat = Math.cos(((latA + latB) / 2 * Math.PI) / 180);
      const xA = lonA * cosLat;
      const yA = latA;
      const xB = lonB * cosLat;
      const yB = latB;
      const xP = lon * cosLat;
      const yP = lat;

      const dx = xB - xA;
      const dy = yB - yA;
      const segmentLenSq = dx * dx + dy * dy;

      let t = 0;
      if (segmentLenSq > 0) {
        t = ((xP - xA) * dx + (yP - yA) * dy) / segmentLenSq;
        t = Math.max(0, Math.min(1, t));
      }

      const projLon = (xA + t * dx) / cosLat;
      const projLat = yA + t * dy;
      const dist = this.haversineDistance(lat, lon, projLat, projLon);

      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = [projLon, projLat];
      }
    }

    return {
      distanceMeters: Math.round(minDistance * 10) / 10,
      nearestPoint: closestPoint,
    };
  }

  /**
   * Point in Polygon Test (Ray Casting Algorithm)
   * Supports complex Polygons with outer boundaries and inner holes.
   * point: [longitude, latitude]
   * polygon: [outerRing, ...holes] where ring is Array of [lon, lat]
   */
  public static pointInPolygon(
    point: [number, number],
    polygonCoordinates: Array<Array<[number, number]>>
  ): boolean {
    if (!polygonCoordinates || polygonCoordinates.length === 0) return false;

    const [lon, lat] = point;
    const outerRing = polygonCoordinates[0];

    // 1. Must be inside outer ring
    let inside = false;
    for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
      const [xi, yi] = outerRing[i];
      const [xj, yj] = outerRing[j];

      const intersect =
        yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    if (!inside) return false;

    // 2. Must not be inside any holes (rings 1..n)
    for (let h = 1; h < polygonCoordinates.length; h++) {
      const hole = polygonCoordinates[h];
      let inHole = false;
      for (let i = 0, j = hole.length - 1; i < hole.length; j = i++) {
        const [xi, yi] = hole[i];
        const [xj, yj] = hole[j];

        const intersect =
          yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inHole = !inHole;
      }
      if (inHole) return false;
    }

    return true;
  }

  /**
   * Point in MultiPolygon Test
   */
  public static pointInMultiPolygon(
    point: [number, number],
    multiPolygonCoordinates: Array<Array<Array<[number, number]>>>
  ): boolean {
    for (const poly of multiPolygonCoordinates) {
      if (this.pointInPolygon(point, poly)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Geodesic Surface Area of a Polygon in Hectares (Ha).
   * 1 Hectare = 10,000 square meters.
   * Computed via spherical excess on the WGS 84 ellipsoid approximation.
   */
  public static calculateGeodesicAreaHa(
    polygonCoordinates: Array<Array<[number, number]>>
  ): number {
    if (!polygonCoordinates || polygonCoordinates.length === 0) return 0;

    const ringArea = (ring: Array<[number, number]>): number => {
      if (ring.length < 3) return 0;
      let totalArea = 0;
      const len = ring.length;

      for (let i = 0; i < len; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[(i + 1) % len];

        const p1 = (lon1 * Math.PI) / 180;
        const p2 = (lon2 * Math.PI) / 180;
        const q1 = (lat1 * Math.PI) / 180;
        const q2 = (lat2 * Math.PI) / 180;

        totalArea += (p2 - p1) * (2 + Math.sin(q1) + Math.sin(q2));
      }

      totalArea = (Math.abs(totalArea) * (this.EARTH_RADIUS_METERS * this.EARTH_RADIUS_METERS)) / 4.0;
      return totalArea;
    };

    // Outer ring positive area
    let areaSqMeters = ringArea(polygonCoordinates[0]);

    // Subtract holes
    for (let h = 1; h < polygonCoordinates.length; h++) {
      areaSqMeters -= ringArea(polygonCoordinates[h]);
    }

    // Convert sq meters to Hectares
    const ha = Math.max(0, areaSqMeters / 10000);
    return Math.round(ha * 100) / 100;
  }

  /**
   * Geodesic Buffer Generation around a Point (Distance in meters)
   * Generates a circular polygon in WGS 84
   */
  public static generatePointBuffer(
    lat: number,
    lon: number,
    distanceMeters: number,
    steps = 32
  ): Array<[number, number]> {
    const coords: Array<[number, number]> = [];
    const r = this.EARTH_RADIUS_METERS;
    const d = distanceMeters / r; // angular distance in radians
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    for (let i = 0; i <= steps; i++) {
      const bearing = (2 * Math.PI * i) / steps;
      const pLat = Math.asin(
        Math.sin(latRad) * Math.cos(d) + Math.cos(latRad) * Math.sin(d) * Math.cos(bearing)
      );
      const pLon =
        lonRad +
        Math.atan2(
          Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
          Math.cos(d) - Math.sin(latRad) * Math.sin(pLat)
        );

      coords.push([
        Math.round(((pLon * 180) / Math.PI) * 1e6) / 1e6,
        Math.round(((pLat * 180) / Math.PI) * 1e6) / 1e6,
      ]);
    }

    return coords;
  }

  /**
   * Compute Bounding Box for any Geometry: [minLon, minLat, maxLon, maxLat]
   */
  public static computeBBox(geometry: { type: string; coordinates: any }): [number, number, number, number] {
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    const traverse = (item: any) => {
      if (typeof item[0] === 'number' && typeof item[1] === 'number') {
        const [lon, lat] = item;
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      } else if (Array.isArray(item)) {
        for (const sub of item) traverse(sub);
      }
    };

    traverse(geometry.coordinates);
    return [minLon, minLat, maxLon, maxLat];
  }

  /**
   * Check if two Bounding Boxes intersect
   */
  public static bboxIntersects(
    a: [number, number, number, number],
    b: [number, number, number, number]
  ): boolean {
    return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
  }

  /**
   * Validate coordinate pairs & geometry integrity
   */
  public static validateGeometry(geometry: { type: string; coordinates: any }): {
    valid: boolean;
    error?: string;
  } {
    if (!geometry || !geometry.type || !geometry.coordinates) {
      return { valid: false, error: 'Geometry kosong atau atribut tipe hilang' };
    }

    const validTypes = [
      'Point',
      'MultiPoint',
      'LineString',
      'MultiLineString',
      'Polygon',
      'MultiPolygon',
    ];
    if (!validTypes.includes(geometry.type)) {
      return { valid: false, error: `Tipe geometri '${geometry.type}' tidak didukung` };
    }

    // Traverse coordinates
    let error: string | undefined = undefined;
    const checkCoords = (c: any) => {
      if (typeof c[0] === 'number' && typeof c[1] === 'number') {
        const [lon, lat] = c;
        if (isNaN(lon) || isNaN(lat)) {
          error = 'Koordinat mengandung nilai NaN';
        }
        if (lat < -90 || lat > 90) {
          error = `Latitude ${lat} berada di luar batas valid [-90, 90]`;
        }
        if (lon < -180 || lon > 180) {
          error = `Longitude ${lon} berada di luar batas valid [-180, 180]`;
        }
      } else if (Array.isArray(c)) {
        for (const sub of c) checkCoords(sub);
      }
    };

    checkCoords(geometry.coordinates);
    if (error) return { valid: false, error };

    // Check closure for polygons
    if (geometry.type === 'Polygon') {
      const outerRing = geometry.coordinates[0];
      if (outerRing && outerRing.length >= 3) {
        const first = outerRing[0];
        const last = outerRing[outerRing.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          return { valid: false, error: 'Ring Polygon tidak tertutup (titik awal != titik akhir)' };
        }
      }
    }

    return { valid: true };
  }
}
