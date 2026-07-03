import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export class LighthouseRunner {
  async run(url) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    try {
      const result = await lighthouse(url, {
        port: chrome.port,
        output: 'json',
        onlyCategories: ['performance','accessibility','best-practices','seo']
      });

      const lhr = result.lhr;
      return {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
        metrics: lhr.audits,
        generatedAt: new Date().toISOString()
      };
    } finally {
      await chrome.kill();
    }
  }
}
