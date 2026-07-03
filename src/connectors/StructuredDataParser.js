export class StructuredDataParser {
  parse(jsonLdBlocks = []) {
    const blocks = Array.isArray(jsonLdBlocks) ? jsonLdBlocks : [jsonLdBlocks];
    const items = blocks.flatMap(block => {
      try {
        const parsed = typeof block === 'string' ? JSON.parse(block) : block;
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    });

    const schemaTypes = items.map(i => i['@type']).filter(Boolean);

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
}
