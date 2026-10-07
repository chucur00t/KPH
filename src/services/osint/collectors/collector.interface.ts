import {
  OsintSource,
  SourceItem,
  RawSource,
  SourceHealth,
} from '../../../types/osint';

export interface IPublicSourceCollector {
  collectorType: 'RSS' | 'API' | 'SITEMAP' | 'HTML' | 'DOCUMENT';
  discover(source: OsintSource): Promise<SourceItem[]>;
  fetch(item: SourceItem): Promise<RawSource>;
  healthCheck(source: OsintSource): Promise<SourceHealth>;
}
