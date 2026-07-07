export class RobotsFetcher {
  async fetch(siteUrl, { timeoutMs = 15000 } = {}) {
    const base = new URL(siteUrl);
    const robotsUrl = new URL('/robots.txt', base).toString();
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NoqqtoAuditBot/0.1; +https://noqqto.com)' },
      signal: AbortSignal.timeout(timeoutMs)
    });

    const content = response.ok ? await response.text() : '';
    const declaredSitemaps = (content.match(/^\s*sitemap:\s*(.+)$/gim) || []).map((line) =>
      line.replace(/^\s*sitemap:\s*/i, '').trim()
    );

    return {
      url: robotsUrl,
      exists: response.ok,
      status: response.status,
      content,
      declaredSitemaps,
      fetchedAt: new Date().toISOString()
    };
  }
}
