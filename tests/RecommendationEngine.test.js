import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../src/services/RecommendationEngine.js';

describe('RecommendationEngine', () => {
  const catalog = {
    a: { impact: 'high', title: 'A' },
    b: { impact: 'low', title: 'B' }
  };
  const engine = new RecommendationEngine(catalog);

  it('drops keys that are missing from the catalog', () => {
    expect(engine.resolve(['b', 'a', 'missing'])).toHaveLength(2);
  });

  it('sorts by impact with high first', () => {
    const result = engine.resolve(['b', 'a']);
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });

  it('returns an empty array for empty input', () => {
    expect(engine.resolve()).toEqual([]);
  });
});
