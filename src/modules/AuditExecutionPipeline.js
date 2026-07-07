/**
 * Runs the full audit: connectors gather raw data in parallel, the
 * MetricNormalizer maps it to the unified schema, services score it, and
 * the report builder assembles the deliverable. Every connector except the
 * crawler is optional; a missing or failing connector degrades confidence
 * instead of sinking the audit.
 */
export class AuditExecutionPipeline {
  constructor({
    crawler,
    metricNormalizer,
    reportBuilder,
    services = [],
    sitemapFetcher = null,
    robotsFetcher = null,
    sslInspector = null,
    dnsInspector = null,
    headerInspector = null,
    structuredDataParser = null,
    lighthouseRunner = null
  }) {
    if (!crawler) throw new Error('crawler is required');
    if (!metricNormalizer) throw new Error('metricNormalizer is required');
    if (!reportBuilder) throw new Error('reportBuilder is required');
    if (services.length === 0) throw new Error('at least one scoring service is required');
    Object.assign(this, {
      crawler,
      metricNormalizer,
      reportBuilder,
      services,
      sitemapFetcher,
      robotsFetcher,
      sslInspector,
      dnsInspector,
      headerInspector,
      structuredDataParser,
      lighthouseRunner
    });
  }

  async execute(seedUrls, { maxPages = 10, external = {}, metadata = {} } = {}) {
    const seeds = Array.isArray(seedUrls) ? seedUrls : [seedUrls];
    const seed = seeds[0];
    if (!seed) throw new Error('At least one seed URL is required.');
    const { hostname } = new URL(seed);

    const settle = (promise) => (promise ? promise.catch(() => null) : Promise.resolve(null));
    const [sitemap, robots, ssl, dns, lighthouse] = await Promise.all([
      settle(this.sitemapFetcher?.fetch(seed)),
      settle(this.robotsFetcher?.fetch(seed)),
      settle(this.sslInspector?.inspect(hostname)),
      settle(this.dnsInspector?.inspect(hostname)),
      settle(this.lighthouseRunner?.run(seed))
    ]);

    // Expand the crawl with same-host pages discovered in the sitemap.
    const sameHostPage = (u) => {
      try {
        const parsed = new URL(u);
        return parsed.hostname === hostname && !parsed.pathname.endsWith('.xml');
      } catch {
        return false;
      }
    };
    const urls = [...new Set([...seeds, ...(sitemap?.discoveredUrls || []).filter(sameHostPage)])].slice(0, maxPages);

    const crawl = await this.crawler.crawl(urls);
    const pages = crawl.pages.map((p) => ({
      ...p,
      structuredData:
        p.analysis && this.structuredDataParser ? this.structuredDataParser.parse(p.analysis.jsonLdBlocks) : null
    }));

    const rawHeaders = pages.find((p) => p.headers)?.headers;
    const headers = rawHeaders && this.headerInspector ? this.headerInspector.inspect(rawHeaders) : null;

    const metrics = this.metricNormalizer.normalize({
      crawl: { ...crawl, pages },
      sitemap,
      robots,
      ssl,
      dns,
      headers,
      lighthouse,
      external
    });

    const scoreCards = this.services.map((service) => service.calculate(metrics));

    return this.reportBuilder.build(scoreCards, {
      ...metadata,
      seedUrl: seed,
      metrics,
      connectors: {
        sitemap: Boolean(sitemap),
        robots: Boolean(robots),
        ssl: Boolean(ssl),
        dns: Boolean(dns),
        headers: Boolean(headers),
        lighthouse: Boolean(lighthouse)
      }
    });
  }
}
