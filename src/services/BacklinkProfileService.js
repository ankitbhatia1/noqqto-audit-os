import { makeCard, bool, atLeast } from '../models/scoring-utils.js';

/** Requires external link data via `external.backlinks`. */
export class BacklinkProfileService {
  calculate(metrics = {}) {
    const b = metrics.backlinks || {};
    return makeCard({
      id: 'backlinks',
      name: 'Backlink Profile',
      recPrefix: 'backlinks.',
      checks: {
        referringDomains: atLeast(b.referringDomains, 50),
        domainDiversity: bool(b.domainDiversity),
        noToxicLinks: b.toxicLinks == null ? null : !b.toxicLinks,
        anchorDistribution: bool(b.anchorDistribution),
        linkVelocity: bool(b.linkVelocity),
        followRatio: bool(b.followRatio)
      }
    });
  }
}
