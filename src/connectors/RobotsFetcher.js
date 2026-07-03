export class RobotsFetcher {
  async fetch(siteUrl) {
    const base = new URL(siteUrl);
    const robotsUrl = new URL('/robots.txt', base).toString();
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'Noqqto Audit OS Bot/0.1'
      }
    });

    return {
      url: robotsUrl,
      exists: response.ok,
      status: response.status,
      content: response.ok ? await response.text() : '',
      fetchedAt: new Date().toISOString()
    };
  }
}
