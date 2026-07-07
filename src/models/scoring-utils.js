import { ScoreCard, ScoreRating } from './ScoreCard.js';
import { scoring, categoryConfig } from '../config/index.js';

export function ratingFor(score) {
  if (score === null || score === undefined) return ScoreRating.NOT_MEASURED;
  const t = scoring.ratings;
  if (score >= t.excellent) return ScoreRating.EXCELLENT;
  if (score >= t.good) return ScoreRating.GOOD;
  if (score >= t.average) return ScoreRating.AVERAGE;
  if (score >= t.poor) return ScoreRating.POOR;
  return ScoreRating.CRITICAL;
}

/** Tri-state helpers: null in means "not measured", null out keeps it that way. */
export const bool = (v) => (v === null || v === undefined ? null : Boolean(v));
export const atLeast = (v, min) => (v === null || v === undefined ? null : Number(v) >= min);
export const atMost = (v, max) => (v === null || v === undefined ? null : Number(v) <= max);

/**
 * checks: { name: true | false | null }
 * Score covers measured checks only. A missing metric must never be
 * reported as a failure; it lowers confidence instead.
 */
export function scoreChecks(checks, { recPrefix = '', baseConfidence = 90 } = {}) {
  const entries = Object.entries(checks);
  const measured = entries.filter(([, v]) => v === true || v === false);
  const passed = measured.filter(([, v]) => v === true);
  const failed = measured.filter(([, v]) => v === false);
  const score = measured.length === 0 ? null : Math.round((passed.length / measured.length) * 100);

  return {
    score,
    rating: ratingFor(score),
    confidence: entries.length === 0 ? 0 : Math.round(baseConfidence * (measured.length / entries.length)),
    measuredChecks: measured.length,
    totalChecks: entries.length,
    evidence: entries.map(([metric, v]) => ({
      metric,
      status: v === true ? 'pass' : v === false ? 'fail' : 'not-measured'
    })),
    recommendations: failed.map(([metric]) => `${recPrefix}${metric}`)
  };
}

/** Builds a ScoreCard for a category, pulling weight and confidence from scoring.json. */
export function makeCard({ id, name, checks, recPrefix, metadata = {} }) {
  const { weight, baseConfidence } = categoryConfig(id);
  const result = scoreChecks(checks, { recPrefix, baseConfidence });
  return new ScoreCard({ id, name, weight, metadata, ...result });
}
