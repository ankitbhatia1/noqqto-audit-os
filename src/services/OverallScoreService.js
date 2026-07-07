import { ratingFor } from '../models/scoring-utils.js';

export class OverallScoreService {
  calculate(scoreCards = []) {
    if (!Array.isArray(scoreCards) || scoreCards.length === 0) {
      throw new Error('At least one ScoreCard is required.');
    }

    // Unmeasured categories are excluded and reported, never counted as zero.
    const measured = scoreCards.filter((c) => c.score !== null);
    const notMeasured = scoreCards.filter((c) => c.score === null);

    const totalWeight = measured.reduce((t, c) => t + (c.weight || 0), 0);
    const score =
      totalWeight === 0 ? null : Math.round(measured.reduce((t, c) => t + c.score * c.weight, 0) / totalWeight);
    const confidence =
      measured.length === 0 ? 0 : Math.round(measured.reduce((t, c) => t + c.confidence, 0) / measured.length);

    const byScore = [...measured].sort((a, b) => b.score - a.score);

    return {
      score,
      confidence,
      rating: ratingFor(score),
      strongest: byScore[0] || null,
      weakest: byScore[byScore.length - 1] || null,
      notMeasured: notMeasured.map((c) => c.name),
      categories: scoreCards
    };
  }
}
