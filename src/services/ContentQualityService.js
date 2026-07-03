import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class ContentQualityService {
  calculate(metrics={}){
    const checks={
      title:!!metrics.title,
      metaDescription:!!metrics.metaDescription,
      headings:!!metrics.headings,
      wordCount:(metrics.wordCount||0)>=800,
      internalLinks:(metrics.internalLinks||0)>=5,
      imagesOptimized:!!metrics.imagesOptimized,
      freshness:!!metrics.freshness
    };
    const passed=Object.values(checks).filter(Boolean).length;
    const score=Math.round((passed/Object.keys(checks).length)*100);
    return new ScoreCard({id:'content-quality',name:'Content Quality',score,weight:20,confidence:90,rating:this.#r(score),evidence:Object.entries(checks).map(([k,v])=>({metric:k,status:v?'pass':'fail'})),recommendations:Object.entries(checks).filter(([,v])=>!v).map(([k])=>`content.${k}`)});
  }
  #r(s){if(s>=90)return ScoreRating.EXCELLENT;if(s>=75)return ScoreRating.GOOD;if(s>=60)return ScoreRating.AVERAGE;if(s>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}
