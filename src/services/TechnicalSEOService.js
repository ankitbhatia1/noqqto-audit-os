import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class TechnicalSEOService {
  calculate(metrics = {}) {
    const checks = {
      https: metrics.https === true,
      indexable: metrics.indexable === true,
      sitemap: metrics.sitemap === true,
      robots: metrics.robots === true,
      canonical: metrics.canonical === true,
      structuredData: metrics.structuredData === true,
      coreWebVitals: metrics.coreWebVitals === true
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passed / Object.keys(checks).length) * 100);

    return new ScoreCard({
      id: 'technical-seo',
      name: 'Technical SEO',
      score,
      weight: 20,
      confidence: 95,
      rating: this.#rating(score),
      evidence: Object.entries(checks).map(([k,v])=>({metric:k,status:v?'pass':'fail'})),
      recommendations: Object.entries(checks).filter(([,v])=>!v).map(([k])=>`technical.${k}`)
    });
  }

  #rating(score){if(score>=90)return ScoreRating.EXCELLENT;if(score>=75)return ScoreRating.GOOD;if(score>=60)return ScoreRating.AVERAGE;if(score>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}
