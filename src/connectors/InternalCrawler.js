export class InternalCrawler {
  constructor({ pageFetcher, htmlParser }) {
    this.pageFetcher = pageFetcher;
    this.htmlParser = htmlParser;
  }

  async crawl(urls = []) {
    const visited = new Set();
    const pages = [];

    for (const url of urls) {
      const normalized = this.#normalize(url);
      if (visited.has(normalized)) continue;
      visited.add(normalized);

      try {
        const page = await this.pageFetcher.fetch(url);
        const analysis = this.htmlParser.parse(page.html, page.finalUrl || url);
        pages.push({ url, finalUrl: page.finalUrl, status: page.status, headers: page.headers, analysis });
      } catch (err) {
        // One dead URL must not sink the whole audit.
        pages.push({ url, status: 0, error: err.message, analysis: null });
      }
    }

    return {
      pages,
      totalPages: pages.length,
      failedPages: pages.filter((p) => p.error || p.status >= 400).length,
      crawledAt: new Date().toISOString()
    };
  }

  #normalize(url) {
    try {
      const u = new URL(url);
      u.hash = '';
      return u.toString().replace(/\/$/, '');
    } catch {
      return url;
    }
  }
}
