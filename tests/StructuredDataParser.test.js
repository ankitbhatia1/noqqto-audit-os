import { describe, it, expect } from 'vitest';
import { StructuredDataParser } from '../src/connectors/StructuredDataParser.js';

describe('StructuredDataParser', () => {
  const parser = new StructuredDataParser();

  it('unwraps @graph blocks the way Yoast and RankMath emit them', () => {
    const yoastBlock = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Noqqto' },
        { '@type': 'WebSite', name: 'Noqqto' },
        { '@type': 'WebPage' }
      ]
    });
    const result = parser.parse([yoastBlock]);
    expect(result.hasOrganization).toBe(true);
    expect(result.hasWebSite).toBe(true);
    expect(result.totalSchemas).toBe(3);
  });

  it('handles array @type values', () => {
    const block = JSON.stringify({ '@type': ['WebPage', 'FAQPage'] });
    expect(parser.parse([block]).hasFAQPage).toBe(true);
  });

  it('ignores invalid JSON without throwing', () => {
    const result = parser.parse(['{not json']);
    expect(result.totalSchemas).toBe(0);
  });

  it('still handles flat single-object blocks', () => {
    const result = parser.parse([JSON.stringify({ '@type': 'Product' })]);
    expect(result.hasProduct).toBe(true);
    expect(result.totalSchemas).toBe(1);
  });
});
