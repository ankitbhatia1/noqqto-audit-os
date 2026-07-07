import tls from 'node:tls';

export class SSLInspector {
  async inspect(hostname, { port = 443, timeoutMs = 10000 } = {}) {
    return new Promise((resolve, reject) => {
      // rejectUnauthorized: false is intentional. An audit tool must be able
      // to inspect and report on broken certificates instead of throwing.
      // The `authorized` flag and `authorizationError` carry the verdict.
      const socket = tls.connect(
        { host: hostname, port, servername: hostname, rejectUnauthorized: false },
        () => {
          const cert = socket.getPeerCertificate();
          const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
          resolve({
            hostname,
            issuer: cert.issuer,
            subject: cert.subject,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysUntilExpiry: validTo ? Math.floor((validTo - Date.now()) / 86400000) : null,
            protocol: socket.getProtocol(),
            authorized: socket.authorized,
            authorizationError: socket.authorized ? null : String(socket.authorizationError || 'unknown'),
            inspectedAt: new Date().toISOString()
          });
          socket.end();
        }
      );

      socket.setTimeout(timeoutMs, () => {
        socket.destroy();
        reject(new Error(`TLS inspection timed out after ${timeoutMs}ms for ${hostname}`));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });
    });
  }
}
