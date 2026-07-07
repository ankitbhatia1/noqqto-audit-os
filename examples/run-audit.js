import { createAuditPipeline } from '../src/index.js';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node examples/run-audit.js <url> [--lighthouse]');
  process.exit(1);
}

const pipeline = createAuditPipeline({ lighthouse: process.argv.includes('--lighthouse') });
const report = await pipeline.execute([url], { maxPages: 5 });

const { summary, roadmap } = report;
console.log(
  JSON.stringify(
    {
      url,
      score: summary.score,
      rating: summary.rating,
      confidence: summary.confidence,
      strongest: summary.strongest?.name ?? null,
      weakest: summary.weakest?.name ?? null,
      notMeasured: summary.notMeasured,
      categories: summary.categories.map((c) => ({ name: c.name, score: c.score, rating: c.rating })),
      quickWins: roadmap.quickWins.map((r) => r.title),
      day30: roadmap.day30.map((r) => r.title)
    },
    null,
    2
  )
);
