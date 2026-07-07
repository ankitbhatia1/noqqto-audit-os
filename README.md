# Noqqto Audit OS

An AI-first SEO audit engine. Connectors gather raw signals from a site, a normalizer maps them onto one documented metric schema, scoring services grade each category, and a report builder assembles an executive summary, dashboard view model, and 90-day roadmap.

Status: v0.2.0, pre-release. The scoring engine is wired end to end and tested. The premium reporting UI described in `docs/DESIGN_PRINCIPLES.md` is not built yet.

## Quick start

```bash
npm install
node examples/run-audit.js https://example.com
```

Add `--lighthouse` to include Core Web Vitals and Lighthouse category scores. This requires a local Chrome install.

## How scoring works

Each category service evaluates a set of checks that can be true, false, or null. Null means the metric was not measured, and this is the load-bearing design decision: **a metric we never measured is excluded from the score and lowers the card's confidence. It is never counted as a failure.** Categories with zero measured checks are reported as "not measured" and excluded from the overall weighted score, so a report never claims a site is failing at something the audit never looked at.

Keyword, authority, and backlink data cannot be derived from HTML and stay unmeasured until you supply them via the `external` option. See `docs/METRIC_SCHEMA.md` for the full schema and an example.

Category weights and rating thresholds live in `src/config/scoring.json`. Recommendation copy lives in `src/config/recommendations.json`, and a test enforces that every key a service can emit has a catalog entry.

## Architecture

```
connectors (crawler, sitemap, robots, ssl, dns, headers, structured data, lighthouse)
        -> MetricNormalizer (unified schema, null = not measured)
        -> scoring services (one ScoreCard per category)
        -> OverallScoreService + RecommendationEngine + RoadmapEngine
        -> AuditReportBuilder (summary, dashboard, roadmap)
```

Every connector except the crawler is optional. A connector that fails or is absent degrades confidence instead of failing the audit.

## Development

```bash
npm test        # vitest
npm run lint    # eslint
```

## Roadmap

- Respect robots.txt rules in the crawler and add per-host rate limiting
- Block private IP ranges in PageFetcher before any server-side deployment (SSRF)
- Crawl concurrency
- LLM analysis step for keyword and AI visibility judgment metrics
- Semrush and Moz import adapters for authority and backlink data
- HTML report renderer per docs/DESIGN_PRINCIPLES.md
