export class RecommendationEngine {
  constructor(catalog = {}) {
    this.catalog = catalog;
  }

  resolve(keys = []) {
    return keys
      .filter((key) => this.catalog[key])
      .map((key) => ({
        id: key,
        ...this.catalog[key]
      }))
      .sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b.impact] || 0) - (order[a.impact] || 0);
      });
  }
}
