export class SitemapFetcher {
  async fetch(siteUrl) {
    const base = new URL(siteUrl);
    const sitemapUrl = new URL('/sitemap.xml', base).toString();
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'Noqqto Audit OS Bot/0.1' }
    });

    const xml = response.ok ? await response.text() : '';
    const urlMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

    return {
      url: sitemapUrl,
      exists: response.ok,
      status: response.status,
      xml,
      discoveredUrls: urlMatches,
      urlCount: urlMatches.length,
      fetchedAt: new Date().toISOString()
    };
  }
}
