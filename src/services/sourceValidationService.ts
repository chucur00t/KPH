import {
  PublicSourceRecord,
  SOURCE_CATEGORIES,
  ACCESS_METHODS,
  SOURCE_STATUSES,
  SourceValidationResult,
  SourceStatus,
} from '../types/registry';

export class SourceValidationService {
  /**
   * Validate a candidate public data source against strict KPH Intelligence rules
   */
  public static validate(candidate: Partial<PublicSourceRecord>): SourceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let suggestedStatus: SourceStatus | undefined = candidate.status;

    // 1. Validate source_id
    if (!candidate.source_id || typeof candidate.source_id !== 'string') {
      errors.push('source_id wajib diisi.');
    } else {
      const id = candidate.source_id.trim();
      if (!/^[A-Z0-9_\-]+$/.test(id)) {
        errors.push('source_id hanya boleh mengandung huruf kapital A-Z, angka 0-9, garis bawah (_), dan tanda hubung (-). Contoh: SRC-NASA-FIRMS-VIIRS');
      }
      if (id.length < 4 || id.length > 64) {
        errors.push('source_id harus memiliki panjang antara 4 hingga 64 karakter.');
      }
    }

    // 2. Validate source_name
    if (!candidate.source_name || candidate.source_name.trim().length < 5) {
      errors.push('source_name wajib diisi minimal 5 karakter deskriptif.');
    }

    // 3. Validate provider
    if (!candidate.provider || candidate.provider.trim().length < 3) {
      errors.push('provider wajib diisi nama instansi/lembaga resmi penerbit data.');
    }

    // 4. Validate category
    if (!candidate.category || !SOURCE_CATEGORIES.includes(candidate.category as any)) {
      errors.push(
        `category '${candidate.category}' tidak valid. Harus salah satu dari: ${SOURCE_CATEGORIES.join(', ')}`
      );
    }

    // 5. Validate access_method
    if (!candidate.access_method || !ACCESS_METHODS.includes(candidate.access_method as any)) {
      errors.push(
        `access_method '${candidate.access_method}' tidak valid. Harus salah satu dari: ${ACCESS_METHODS.join(', ')}`
      );
    }

    // 6. Validate endpoint URL
    if (!candidate.endpoint || typeof candidate.endpoint !== 'string') {
      errors.push('endpoint wajib diisi.');
    } else {
      try {
        const url = new URL(candidate.endpoint.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errors.push('endpoint harus menggunakan protokol http:// atau https://');
        }
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.internal')) {
          errors.push('Hard constraint: Endpoint internal/lokal dilarang. Hanya data publik yang diizinkan.');
        }
        if (url.hostname.includes('example.com') || url.hostname.includes('fictitious.org')) {
          errors.push('Hard constraint: Endpoint fiktif dilarang.');
        }
      } catch {
        errors.push('endpoint bukan format URL yang valid.');
      }
    }

    // 7. Validate documentation_url
    if (!candidate.documentation_url || typeof candidate.documentation_url !== 'string') {
      errors.push('documentation_url wajib diisi referensi dokumentasi resmi publik.');
    } else {
      try {
        const docUrl = new URL(candidate.documentation_url.trim());
        if (docUrl.protocol !== 'http:' && docUrl.protocol !== 'https:') {
          errors.push('documentation_url harus menggunakan protokol http:// atau https://');
        }
      } catch {
        errors.push('documentation_url bukan format URL yang valid.');
      }
    }

    // 8. Validate license
    if (!candidate.license || candidate.license.trim().length < 3) {
      errors.push('license wajib diisi klausul lisensi terbuka atau kebijakan satu data.');
    }

    // 9. Validate description, coverage, data_type, format, update_frequency
    if (!candidate.description || candidate.description.trim().length < 10) {
      errors.push('description wajib diisi minimal 10 karakter penjelas.');
    }
    if (!candidate.coverage || candidate.coverage.trim().length < 3) {
      errors.push('coverage wajib diisi wilayah jangkauan data spasial/informasi.');
    }
    if (!candidate.data_type || candidate.data_type.trim().length < 2) {
      errors.push('data_type wajib diisi tipe data.');
    }
    if (!candidate.format || candidate.format.trim().length < 2) {
      errors.push('format wajib diisi format pertukaran data (e.g. CSV, GeoJSON, WMS, STAC).');
    }
    if (!candidate.update_frequency || candidate.update_frequency.trim().length < 2) {
      errors.push('update_frequency wajib diisi frekuensi pembaruan.');
    }

    // 10. Validate status and enforce Hard Constraints
    if (!candidate.status || !SOURCE_STATUSES.includes(candidate.status as any)) {
      errors.push(`status '${candidate.status}' tidak valid. Harus salah satu dari: ${SOURCE_STATUSES.join(', ')}`);
    } else {
      // Rule: If endpoint has never had a successful health check or verification, default to UNVERIFIED
      if (candidate.status === 'ACTIVE' && !candidate.last_successful_update) {
        warnings.push('Sumber data baru yang belum berhasil diverifikasi/dites sebaiknya berstatus UNVERIFIED hingga health check perdana berhasil.');
        suggestedStatus = 'UNVERIFIED';
      }
      
      // Rule: Check if notes indicate legal/technical uncertainty
      const combinedNotes = `${candidate.notes || ''} ${candidate.license || ''}`.toLowerCase();
      if (
        (combinedNotes.includes('belum jelas') ||
          combinedNotes.includes('telaah') ||
          combinedNotes.includes('requires review') ||
          combinedNotes.includes('menunggu konfirmasi')) &&
        candidate.status !== 'REQUIRES REVIEW'
      ) {
        warnings.push('Terdapat ketidakpastian hukum atau teknis pada deskripsi lisensi/catatan. Status disarankan menjadi REQUIRES REVIEW.');
        suggestedStatus = 'REQUIRES REVIEW';
      }
    }

    // 11. Validate reliability & attribution
    if (!candidate.reliability || candidate.reliability.trim().length < 3) {
      errors.push('reliability wajib diisi level keandalan data.');
    }
    if (!candidate.attribution || candidate.attribution.trim().length < 3) {
      errors.push('attribution wajib diisi teks atribusi resmi.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestedStatus,
    };
  }
}
