import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class AuthorityService {
  constructor(weight = 15) { this.weight = weight; }

  calculate(metrics = {}) {
    const authority=this.#n(metrics.authority);
    const referringDomains=this.#n(metrics.referringDomains);
    const spamScore=100-this.#n(metrics.spamScore);
    const score=Math.round((authority*0.5)+(referringDomains*0.3)+(spamScore*0.2));
    return new ScoreCard({
      id:'authority',name:'Authority',score,weight:this.weight,confidence:this.#confidence(metrics),rating:this.#rating(score),
      evidence:this.#evidence(authority,referringDomains,spamScore),
      recommendations:this.#recommendations(authority,referringDomains,spamScore)
    });
  }
  #n(v){return Math.max(0,Math.min(100,Number(v??0)));}
  #confidence(m){return ['authority','referringDomains','spamScore'].filter(k=>m[k]!=null).length*33;}
  #evidence(a,r,s){const e=[];if(a<50)e.push({id:'low-authority',metric:'authority',value:a});if(r<40)e.push({id:'low-ref-domains',metric:'referringDomains',value:r});if(s<60)e.push({id:'high-spam',metric:'spamScore',value:100-s});return e;}
  #recommendations(a,r,s){const k=[];if(a<60)k.push('authority.digital-pr');if(r<50)k.push('authority.link-gap');if(s<70)k.push('authority.anchor-diversity');return k;}
  #rating(score){if(score>=90)return ScoreRating.EXCELLENT;if(score>=75)return ScoreRating.GOOD;if(score>=60)return ScoreRating.AVERAGE;if(score>=40)return ScoreRating.POOR;return ScoreRating.CRITICAL;}
}