export class HeaderInspector {
  inspect(headers = {}) {
    const get = (name) => headers[name.toLowerCase()] || headers[name] || null;
    return {
      contentType: get('content-type'),
      contentEncoding: get('content-encoding'),
      cacheControl: get('cache-control'),
      etag: get('etag'),
      server: get('server'),
      xRobotsTag: get('x-robots-tag'),
      hsts: get('strict-transport-security'),
      csp: get('content-security-policy'),
      xFrameOptions: get('x-frame-options'),
      xContentTypeOptions: get('x-content-type-options'),
      referrerPolicy: get('referrer-policy'),
      permissionsPolicy: get('permissions-policy')
    };
  }
}
