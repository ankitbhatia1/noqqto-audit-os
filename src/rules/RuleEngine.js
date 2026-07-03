export class RuleEngine {
  constructor(rules = []) {
    this.rules = rules;
  }

  evaluate(metrics = {}) {
    return this.rules
      .filter(rule => typeof rule.condition === 'function')
      .map(rule => ({
        id: rule.id,
        category: rule.category,
        severity: rule.severity,
        passed: !rule.condition(metrics),
        recommendation: rule.recommendation,
        scoreImpact: rule.scoreImpact || 0
      }));
  }
}
