import * as cheerio from 'cheerio';

export class HTMLParser {
  /**
   * @param {string} html
   * @param {string} [baseUrl] When provided, links are resolved against it so
   *   internal and external links are counted separately. Without it, all
   *   anchors count as internal (legacy behaviour).
   */
  parse(html, baseUrl = '') {
    const $ = cheerio.load(html);

    const body = $('body').clone();
    body.find('script, style, noscript, template').remove();
    // Strip tags to spaces so adjacent blocks don't glue words together.
    const bodyText = (body.html() || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-zA-Z#0-9]+;/g, ' ');
    const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;

    const hrefs = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get();

    let internalLinks = hrefs.length;
    let externalLinks = 0;

    if (baseUrl) {
      internalLinks = 0;
      const origin = new URL(baseUrl).origin;
      for (const href of hrefs) {
        try {
          const resolved = new URL(href, baseUrl);
          if (!/^https?:$/.test(resolved.protocol)) continue; // mailto:, tel:, javascript:
          if (resolved.origin === origin) internalLinks++;
          else externalLinks++;
        } catch {
          // malformed href, skip
        }
      }
    }

    return {
      title: $('title').text().trim(),
      wordCount,
      metaDescription: $('meta[name="description"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      headings: $('h1,h2,h3,h4,h5,h6').length,
      images: $('img').length,
      imagesMissingAlt: $('img:not([alt])').length,
      imagesEmptyAlt: $('img[alt=""]').length,
      internalLinks,
      externalLinks,
      totalLinks: hrefs.length,
      robots: $('meta[name="robots"]').attr('content') || '',
      language: $('html').attr('lang') || '',
      viewport: $('meta[name="viewport"]').attr('content') || '',
      jsonLdBlocks: $('script[type="application/ld+json"]')
        .map((_, el) => $(el).text())
        .get()
    };
  }
}
