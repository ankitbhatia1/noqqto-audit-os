import { ScoreRating } from '../models/ScoreCard.js';

export class OverallScoreService {
  calculate(scoreCards = []) {
    if (!Array.isArray(scoreCards) || scoreCards.length === 0) {
      throw new Error('At least one ScoreCard is required.');
    }

    const totalWeight = scoreCards.reduce((t,c)=>t+(c.weight||0),0);
    const score = totalWeight===0 ? 0 : Math.round(scoreCards.reduce((t,c)=>t+(c.score*c.weight),0)/totalWeight);
    const confidence = Math.round(scoreCards.reduce((t,c)=>t+c.confidence,0)/scoreCards.length);

    return {
      score,
      confidence,
      rating:this.determineRating(score),
      strongest:[...scoreCards].sort((a,b)=>b.score-a.score)[0],
      weakest:[...scoreCards].sort((a,b)=>a.score-b.score)[0],
      categories:scoreCards
    };
  }

  determineRating(score){
    if(score>=90)return ScoreRating.EXCELLENT;
    if(score>=75)return ScoreRating.GOOD;
    if(score>=60)return ScoreRating.AVERAGE;
    if(score>=40)return ScoreRating.POOR;
    return ScoreRating.CRITICAL;
  }
}
