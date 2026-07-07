import { makeCard, bool, atLeast } from '../models/scoring-utils.js';

export class ContentQualityService {
  calculate(metrics = {}) {
    const c = metrics.content || {};
    return makeCard({
      id: 'content-quality',
      name: 'Content Quality',
      recPrefix: 'content.',
      checks: {
        titles: atLeast(c.titleCoverage, 0.9),
        metaDescriptions: atLeast(c.metaDescriptionCoverage, 0.8),
        headings: atLeast(c.h1Coverage, 0.9),
        wordCount: atLeast(c.avgWordCount, 800),
        internalLinking: atLeast(c.avgInternalLinks, 5),
        imageAlt: atLeast(c.imageAltCoverage, 0.9),
        language: bool(c.languageDeclared)
      },
      metadata: { avgWordCount: c.avgWordCount ?? null, avgInternalLinks: c.avgInternalLinks ?? null }
    });
  }
}
