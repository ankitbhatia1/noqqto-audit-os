import * as cheerio from 'cheerio';

export class HTMLParser {
  parse(html) {
    const $ = cheerio.load(html);
    return {
      title: $('title').text().trim(),
      metaDescription: $('meta[name="description"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      h1: $('h1').map((_,el)=>$(el).text().trim()).get(),
      headings: $('h1,h2,h3,h4,h5,h6').length,
      images: $('img').length,
      imagesMissingAlt: $('img:not([alt]), img[alt=""]').length,
      internalLinks: $('a[href]').length,
      robots: $('meta[name="robots"]').attr('content') || '',
      language: $('html').attr('lang') || '',
      viewport: $('meta[name="viewport"]').attr('content') || '',
      jsonLdBlocks: $('script[type="application/ld+json"]').length
    };
  }
}
