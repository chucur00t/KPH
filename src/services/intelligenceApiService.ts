import {
  ExecutiveBriefingObject,
  IntelligenceAlert,
  NaturalLanguageQueryResponse,
  DataQualityReport,
  AiModelConfig,
  AiPromptConfig,
  AiAuditLog,
} from '../types/intelligenceEngine';

export class IntelligenceApiService {
  /**
   * Fetch latest executive briefing
   */
  public static async getLatestBriefing(forceRefresh = false): Promise<ExecutiveBriefingObject | null> {
    try {
      const url = `/api/v1/intelligence/briefings/latest${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Generate customized briefing (Daily, Weekly, Monthly, Area)
   */
  public static async generateBriefing(
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AREA_SPECIFIC',
    areaId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<ExecutiveBriefingObject | null> {
    try {
      const res = await fetch('/api/v1/intelligence/briefings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, areaId, dateRange }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Ask natural language question to intelligence engine
   */
  public static async askIntelligence(question: string): Promise<NaturalLanguageQueryResponse | null> {
    try {
      const res = await fetch('/api/v1/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch active intelligence alerts
   */
  public static async getAlerts(): Promise<IntelligenceAlert[]> {
    try {
      const res = await fetch('/api/v1/intelligence/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.alerts || [];
    } catch {
      return [];
    }
  }

  /**
   * Acknowledge alert
   */
  public static async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/intelligence/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        method: 'POST',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch data quality & gap audit report
   */
  public static async getDataQuality(): Promise<DataQualityReport | null> {
    try {
      const res = await fetch('/api/v1/intelligence/data-quality');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch model configs & usage
   */
  public static async getModelConfigs(): Promise<{ models: AiModelConfig[]; usage: any }> {
    try {
      const res = await fetch('/api/v1/intelligence/models');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { models: [], usage: null };
    }
  }

  /**
   * Fetch prompt registry
   */
  public static async getPromptConfigs(): Promise<AiPromptConfig[]> {
    try {
      const res = await fetch('/api/v1/intelligence/prompts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.prompts || [];
    } catch {
      return [];
    }
  }

  /**
   * Export briefing
   */
  public static getExportUrl(format: 'html' | 'json' | 'csv' | 'pdf_view'): string {
    return `/api/v1/intelligence/export/${format}`;
  }
}
