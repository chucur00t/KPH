import { AiModelConfig } from '../../types/intelligenceEngine';

export class ModelRegistry {
  private static models: AiModelConfig[] = [
    {
      model_id: 'MOD-GEMINI-3.8-FLASH',
      provider: 'Google DeepMind',
      model_name: 'gemini-3.8-flash',
      model_version: '3.8-2026',
      purpose: 'BRIEFING, SUMMARIZATION, NATURAL_LANGUAGE_QUERY',
      temperature: 0.1,
      max_tokens: 4096,
      active: true,
      created_at: '2026-09-26T00:00:00.000Z',
    },
    {
      model_id: 'MOD-DETERMINISTIC-FALLBACK',
      provider: 'KPH Rule-Based Synthesizer',
      model_name: 'deterministic-provenance-engine',
      model_version: 'v1.4.0',
      purpose: 'OFFLINE_FALLBACK_ANALYSIS',
      temperature: 0.0,
      max_tokens: 2048,
      active: true,
      created_at: '2026-09-26T00:00:00.000Z',
    },
  ];

  private static usageStats = {
    requests_today: 18,
    tokens_today: 28450,
    estimated_cost_usd: 0.0035,
    requests_this_month: 240,
    estimated_monthly_cost_usd: 0.048,
    last_request_at: new Date().toISOString(),
  };

  public static getModels(): AiModelConfig[] {
    return [...this.models];
  }

  public static getActiveModel(): AiModelConfig {
    return this.models.find((m) => m.active && m.model_name === 'gemini-3.8-flash') || this.models[0];
  }

  public static getUsageStats() {
    return { ...this.usageStats };
  }

  public static recordUsage(promptTokens: number, completionTokens: number) {
    this.usageStats.requests_today++;
    this.usageStats.requests_this_month++;
    this.usageStats.tokens_today += promptTokens + completionTokens;
    this.usageStats.last_request_at = new Date().toISOString();
  }
}
