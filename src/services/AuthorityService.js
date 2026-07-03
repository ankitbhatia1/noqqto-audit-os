import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class AuthorityService {
  constructor(weight = 15) {
    this.weight = weight;
  }

  calculate(metrics = {}) {
    const authority = this.#normalize(metrics.authority);
    const referringDomains = this.#normalize(metrics.referringDomains);
    const spamScore = 100 - this.#normalize(metrics.spamScore);

    const score = Math.round((authority * 0.5) + (referringDomains * 0.3) + (spamScore * 0.2));

    return new ScoreCard({
      id: 'authority',
      name: 'Authority',
      score,
      weight: this.weight,
      confidence: 95,
      rating: this.#rating(score),
      evidence: [],
      recommendations: []
    });
  }

  #normalize(value){
    const n = Number(value ?? 0);
    return Math.max(0, Math.min(100, n));
  }

  #rating(score){
    if(score>=90) return ScoreRating.EXCELLENT;
    if(score>=75) return ScoreRating.GOOD;
    if(score>=60) return ScoreRating.AVERAGE;
    if(score>=40) return ScoreRating.POOR;
    return ScoreRating.CRITICAL;
  }
}
