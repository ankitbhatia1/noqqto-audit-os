import axe from 'axe-core';

export class AccessibilityScanner {
  async scan(document) {
    const results = await axe.run(document);
    return {
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        affectedNodes: v.nodes.length
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      scannedAt: new Date().toISOString()
    };
  }
}
