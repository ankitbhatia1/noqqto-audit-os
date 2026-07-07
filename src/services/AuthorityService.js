import { makeCard, atLeast, atMost } from '../models/scoring-utils.js';

/** Requires external link data (e.g. a Semrush or Moz export) via `external.authority`. */
export class AuthorityService {
  calculate(metrics = {}) {
    const a = metrics.authority || {};
    return makeCard({
      id: 'authority',
      name: 'Authority',
      recPrefix: 'authority.',
      checks: {
        domainAuthority: atLeast(a.authority, 50),
        referringDomains: atLeast(a.referringDomains, 50),
        lowSpamScore: atMost(a.spamScore, 30)
      },
      metadata: {
        authority: a.authority ?? null,
        referringDomains: a.referringDomains ?? null,
        spamScore: a.spamScore ?? null
      }
    });
  }
}
