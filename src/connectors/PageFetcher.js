const DEFAULT_UA = 'Mozilla/5.0 (compatible; NoqqtoAuditBot/0.1; +https://noqqto.com)';

export class PageFetcher {
  constructor({ timeoutMs = 15000, userAgent = DEFAULT_UA } = {}) {
    this.timeoutMs = timeoutMs;
    this.userAgent = userAgent;
  }

  async fetch(url) {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
      redirect: 'follow',
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    const html = await response.text();

    return {
      url,
      finalUrl: response.url,
      redirected: response.redirected,
      ok: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      html
    };
  }
}
