import { makeCard, bool, atLeast, atMost } from '../models/scoring-utils.js';

export class PerformanceService {
  calculate(metrics = {}) {
    const p = metrics.performance || {};
    return makeCard({
      id: 'performance',
      name: 'Performance',
      recPrefix: 'performance.',
      checks: {
        lighthousePerformance: atLeast(p.lighthousePerformance, 80),
        lcp: atMost(p.lcpMs, 2500),
        cls: atMost(p.cls, 0.1),
        tbt: atMost(p.tbtMs, 200),
        caching: bool(p.cacheControl),
        compression: bool(p.compression)
      },
      metadata: {
        lighthousePerformance: p.lighthousePerformance ?? null,
        lcpMs: p.lcpMs ?? null,
        cls: p.cls ?? null,
        tbtMs: p.tbtMs ?? null
      }
    });
  }
}
