/** Noqqto Audit OS ScoreCard */
export const ScoreRating = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor',
  CRITICAL: 'critical',
  NOT_MEASURED: 'not-measured'
});

export class ScoreCard {
  constructor({
    id,
    name,
    score = null,
    weight = 0,
    confidence = 100,
    rating = ScoreRating.NOT_MEASURED,
    evidence = [],
    recommendations = [],
    measuredChecks = 0,
    totalChecks = 0,
    metadata = {}
  } = {}) {
    if (!id) throw new Error('id required');
    if (!name) throw new Error('name required');
    this.id = id;
    this.name = name;
    // null means "not measured": we had no data, which is different from scoring zero.
    this.score = score === null || score === undefined ? null : Math.max(0, Math.min(100, Number(score)));
    this.measured = this.score !== null;
    this.weight = Math.max(0, Number(weight));
    this.confidence = Math.max(0, Math.min(100, Number(confidence)));
    this.rating = rating;
    this.measuredChecks = measuredChecks;
    this.totalChecks = totalChecks;
    this.evidence = Object.freeze([...evidence]);
    this.recommendations = Object.freeze([...recommendations]);
    this.metadata = Object.freeze({ ...metadata });
    Object.freeze(this);
  }

  toJSON() {
    return { ...this };
  }
}
