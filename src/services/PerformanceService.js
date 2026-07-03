import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class PerformanceService {
  calculate(metrics={}){
    const checks={lcp:!!metrics.lcp,inp:!!metrics.inp,cls:!!metrics.cls,ttfb:!!metrics.ttfb,mobile:!!metrics.mobileScore,desktop:!!metrics.desktopScore,images:!!metrics.imageOptimization,js:!!metrics.javascriptOptimization,css:!!metrics.cssOptimization,cache:!!metrics.browserCaching,compression:!!metrics.compression,cdn:!!metrics.cdn};
    const passed=Object.values(checks).filter(Boolean).length;
    const score=Math.round((passed/Object.keys(checks).length)*100);
    return new ScoreCard({id:'performance',name:'Performance',score,weight:15,confidence:92,rating:this.#r(score),evidence:Object.entries(checks).map(([m,v])=>({metric:m,status:v?'pass':'fail'})),recommendations:Object.entries(checks).filter(([,v])=>!v).map(([m])=>`performance.${m}`)});
  }
  #r(s){if(s>=90)return ScoreRating.EXCELLENT;if(s>=75)return ScoreRating.GOOD;if(s>=60)return ScoreRating.AVERAGE;if(s>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}
