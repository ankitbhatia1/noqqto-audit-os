import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class AIVisibilityService {
  calculate(metrics = {}) {
    const checks = {
      aiOverviewReady: !!metrics.aiOverviewReady,
      answerEngineOptimized: !!metrics.answerEngineOptimized,
      entityCoverage: !!metrics.entityCoverage,
      structuredContent: !!metrics.structuredContent,
      citationReady: !!metrics.citationReady,
      llmFormatting: !!metrics.llmFormatting,
      conversationalCoverage: !!metrics.conversationalCoverage,
      faqCoverage: !!metrics.faqCoverage
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passed / Object.keys(checks).length) * 100);
    return new ScoreCard({id:'ai-visibility',name:'AI Visibility',score,weight:15,confidence:88,rating:this.#r(score),evidence:Object.entries(checks).map(([m,v])=>({metric:m,status:v?'pass':'fail'})),recommendations:Object.entries(checks).filter(([,v])=>!v).map(([m])=>`ai.${m}`)});
  }
  #r(s){if(s>=90)return ScoreRating.EXCELLENT;if(s>=75)return ScoreRating.GOOD;if(s>=60)return ScoreRating.AVERAGE;if(s>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}
