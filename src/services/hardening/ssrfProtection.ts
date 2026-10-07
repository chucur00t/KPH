/**
 * KPH INTELLIGENCE - SSRF PROTECTION & URL VALIDATOR (FASE 9)
 * Protects public crawlers, RSS ingesters, and collectors against SSRF attacks.
 * Blocks localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254 (metadata service),
 * RFC1918 private IPv4 ranges, link-local, IPv6 loopback, and internal hostnames.
 */

import { URL } from 'url';
import net from 'net';

export class SsrfProtection {
  private static BLOCKED_HOSTNAMES = new Set([
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    'metadata.google.internal',
    '169.254.169.254',
  ]);

  /**
   * Validate whether a target URL is safe to fetch from the public web.
   * Returns true if safe, throws or returns false if blocked.
   */
  public static isSafePublicUrl(rawUrl: string): { safe: boolean; reason?: string } {
    try {
      const parsed = new URL(rawUrl);

      // 1. Only allow HTTP and HTTPS
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { safe: false, reason: `Protocol ${parsed.protocol} is not permitted. Only HTTP/HTTPS allowed.` };
      }

      const hostname = parsed.hostname.toLowerCase();

      // 2. Check blocked hostname list
      if (this.BLOCKED_HOSTNAMES.has(hostname)) {
        return { safe: false, reason: `Hostname ${hostname} is explicitly blocked.` };
      }

      // 3. Block loopback, local domains and cloud metadata
      if (hostname.endsWith('.internal') || hostname.endsWith('.local') || hostname.endsWith('.localhost')) {
        return { safe: false, reason: `Internal domain extension is blocked.` };
      }

      // 4. Check if it's an IP address
      if (net.isIP(hostname)) {
        if (this.isPrivateOrReservedIp(hostname)) {
          return { safe: false, reason: `Direct access to private or reserved IP ${hostname} is blocked.` };
        }
      }

      return { safe: true };
    } catch (e: any) {
      return { safe: false, reason: `Malformed URL: ${e.message}` };
    }
  }

  /**
   * Check if IP address is RFC1918, loopback, link-local, or cloud metadata
   */
  public static isPrivateOrReservedIp(ip: string): boolean {
    // IPv4 Checks
    if (net.isIPv4(ip)) {
      const parts = ip.split('.').map((p) => parseInt(p, 10));
      if (parts.length !== 4) return true;

      // 127.0.0.0/8 (Loopback)
      if (parts[0] === 127) return true;

      // 0.0.0.0/8 (Current network)
      if (parts[0] === 0) return true;

      // 10.0.0.0/8 (RFC1918 Private)
      if (parts[0] === 10) return true;

      // 172.16.0.0/12 (RFC1918 Private: 172.16.0.0 - 172.31.255.255)
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

      // 192.168.0.0/16 (RFC1918 Private)
      if (parts[0] === 192 && parts[1] === 168) return true;

      // 169.254.0.0/16 (Link-local & AWS/GCP/Azure instance metadata)
      if (parts[0] === 169 && parts[1] === 254) return true;

      // 100.64.0.0/10 (Carrier-grade NAT)
      if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;

      // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
      if (parts[0] >= 224) return true;
    }

    // IPv6 Checks
    if (net.isIPv6(ip)) {
      const normalized = ip.toLowerCase();
      // ::1 Loopback
      if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
      // fe80:: Link-local
      if (normalized.startsWith('fe80:')) return true;
      // fc00:: / fd00:: Unique local address
      if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    }

    return false;
  }
}
