import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';
export class BacklinkProfileService {
 calculate(metrics={}){
 const checks={referringDomains:!!metrics.referringDomains,domainDiversity:!!metrics.domainDiversity,toxicLinks:!metrics.toxicLinks,anchorDistribution:!!metrics.anchorDistribution,linkVelocity:!!metrics.linkVelocity,followRatio:!!metrics.followRatio};
 const passed=Object.values(checks).filter(Boolean).length; const score=Math.round((passed/Object.keys(checks).length)*100);
 return new ScoreCard({id:'backlinks',name:'Backlink Profile',score,weight:15,confidence:90,rating:this.#r(score),evidence:Object.entries(checks).map(([m,v])=>({metric:m,status:v?'pass':'fail'})),recommendations:Object.entries(checks).filter(([,v])=>!v).map(([m])=>`backlinks.${m}`)});
 }
 #r(s){if(s>=90)return ScoreRating.EXCELLENT;if(s>=75)return ScoreRating.GOOD;if(s>=60)return ScoreRating.AVERAGE;if(s>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}