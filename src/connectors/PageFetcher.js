export class PageFetcher {
  async fetch(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Noqqto Audit OS Bot/0.1'
      }
    });

    const html = await response.text();

    return {
      url,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      html
    };
  }
}
