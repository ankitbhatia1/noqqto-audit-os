export class InternalCrawler {
  constructor({ pageFetcher, htmlParser }) {
    this.pageFetcher = pageFetcher;
    this.htmlParser = htmlParser;
  }

  async crawl(urls = []) {
    const visited = new Set();
    const pages = [];

    for (const url of urls) {
      if (visited.has(url)) continue;
      visited.add(url);

      const page = await this.pageFetcher.fetch(url);
      const analysis = this.htmlParser.parse(page.html);

      pages.push({
        url,
        status: page.status,
        analysis
      });
    }

    return {
      pages,
      totalPages: pages.length,
      crawledAt: new Date().toISOString()
    };
  }
}
