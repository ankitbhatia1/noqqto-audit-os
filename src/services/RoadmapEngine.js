export class RoadmapEngine {
  build(scoreCards = [], recommendationEngine) {
    const keys = [...new Set(scoreCards.flatMap(c => c.recommendations || []))];
    const recommendations = recommendationEngine.resolve(keys);
    const phases = { quickWins: [], day30: [], day60: [], day90: [] };
    for (const rec of recommendations) {
      if (rec.difficulty === 'low') phases.quickWins.push(rec);
      else if (rec.impact === 'high') phases.day30.push(rec);
      else if (rec.impact === 'medium') phases.day60.push(rec);
      else phases.day90.push(rec);
    }
    return phases;
  }
}
