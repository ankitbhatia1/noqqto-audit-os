import { describe, it, expect } from 'vitest';
import { HTMLParser } from '../src/connectors/HTMLParser.js';

describe('HTMLParser', () => {
  const parser = new HTMLParser();
  const html = `
    <html lang="en"><head><title> Noqqto </title>
    <meta name="description" content="desc">
    <script type="application/ld+json">{"@type":"Organization"}</script>
    </head><body>
      <h1>Hello</h1>
      <a href="/services">internal</a>
      <a href="https://noqqto.com/contact">internal absolute</a>
      <a href="https://example.com">external</a>
      <a href="mailto:hi@noqqto.com">mail</a>
      <img src="a.jpg">
      <img src="b.jpg" alt="">
      <img src="c.jpg" alt="described">
    </body></html>`;

  it('separates internal and external links when a base URL is given', () => {
    const result = parser.parse(html, 'https://noqqto.com/');
    expect(result.internalLinks).toBe(2);
    expect(result.externalLinks).toBe(1);
    expect(result.totalLinks).toBe(4);
  });

  it('distinguishes missing alt from intentionally empty alt', () => {
    const result = parser.parse(html, 'https://noqqto.com/');
    expect(result.imagesMissingAlt).toBe(1);
    expect(result.imagesEmptyAlt).toBe(1);
  });

  it('returns JSON-LD block contents so StructuredDataParser can consume them', () => {
    const result = parser.parse(html, 'https://noqqto.com/');
    expect(result.jsonLdBlocks).toHaveLength(1);
    expect(result.jsonLdBlocks[0]).toContain('Organization');
  });
});
