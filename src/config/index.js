import { readFileSync } from 'node:fs';

const load = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));

export const scoring = load('./scoring.json');
export const recommendationCatalog = load('./recommendations.json');

export function categoryConfig(id) {
  return scoring.categories[id] || { weight: 0, baseConfidence: 80 };
}
