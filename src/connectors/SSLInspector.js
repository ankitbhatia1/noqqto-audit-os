import tls from 'node:tls';

export class SSLInspector {
  async inspect(hostname) {
    return new Promise((resolve, reject) => {
      const socket = tls.connect({ host: hostname, port: 443, servername: hostname }, () => {
        const cert = socket.getPeerCertificate();
        resolve({
          hostname,
          issuer: cert.issuer,
          subject: cert.subject,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          protocol: socket.getProtocol(),
          authorized: socket.authorized,
          inspectedAt: new Date().toISOString()
        });
        socket.end();
      });
      socket.on('error', reject);
    });
  }
}
