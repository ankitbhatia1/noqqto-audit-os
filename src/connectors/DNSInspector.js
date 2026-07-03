import { promises as dns } from 'node:dns';

export class DNSInspector {
  async inspect(hostname) {
    const [a = [], aaaa = [], mx = [], ns = []] = await Promise.allSettled([
      dns.resolve4(hostname),
      dns.resolve6(hostname),
      dns.resolveMx(hostname),
      dns.resolveNs(hostname)
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));

    return {
      hostname,
      ipv4: a,
      ipv6: aaaa,
      mx,
      nameservers: ns,
      inspectedAt: new Date().toISOString()
    };
  }
}
