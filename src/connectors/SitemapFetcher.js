const decodeXmlEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'');

export class SitemapFetcher {
  async fetch(siteUrl, { timeoutMs = 15000 } = {}) {
    const base = new URL(siteUrl);
    const sitemapUrl = new URL('/sitemap.xml', base).toString();
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NoqqtoAuditBot/0.1; +https://noqqto.com)' },
      signal: AbortSignal.timeout(timeoutMs)
    });

    const xml = response.ok ? await response.text() : '';
    // [\s\S] instead of . so pretty-printed sitemaps with the URL on its own
    // line still match, then trim and decode entities (&amp; in URLs is common).
    const urlMatches = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) =>
      decodeXmlEntities(m[1].trim())
    );

    return {
      url: sitemapUrl,
      exists: response.ok,
      status: response.status,
      xml,
      isSitemapIndex: /<sitemapindex[\s>]/i.test(xml),
      discoveredUrls: urlMatches,
      urlCount: urlMatches.length,
      fetchedAt: new Date().toISOString()
    };
  }
}
