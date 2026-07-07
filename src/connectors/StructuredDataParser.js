export class StructuredDataParser {
  parse(jsonLdBlocks = []) {
    const blocks = Array.isArray(jsonLdBlocks) ? jsonLdBlocks : [jsonLdBlocks];
    const items = blocks.flatMap(block => {
      try {
        const parsed = typeof block === 'string' ? JSON.parse(block) : block;
        return this.#flatten(parsed);
      } catch {
        return [];
      }
    });

    const schemaTypes = items.flatMap(item => {
      const type = item?.['@type'];
      return Array.isArray(type) ? type : type ? [type] : [];
    });

    return {
      totalSchemas: items.length,
      schemaTypes,
      hasOrganization: schemaTypes.includes('Organization'),
      hasWebSite: schemaTypes.includes('WebSite'),
      hasFAQPage: schemaTypes.includes('FAQPage'),
      hasProduct: schemaTypes.includes('Product'),
      hasArticle: schemaTypes.includes('Article'),
      hasLocalBusiness: schemaTypes.includes('LocalBusiness')
    };
  }

  /**
   * Unwraps arrays and @graph containers (Yoast, RankMath and most
   * WordPress SEO plugins emit a single block wrapping everything in @graph).
   */
  #flatten(node) {
    if (Array.isArray(node)) return node.flatMap(n => this.#flatten(n));
    if (!node || typeof node !== 'object') return [];

    const out = [];
    if (Array.isArray(node['@graph'])) {
      out.push(...this.#flatten(node['@graph']));
      if (node['@type']) out.push(node);
    } else {
      out.push(node);
    }
    return out;
  }
}
