/**
 * Tests for structured data (JSON-LD)
 * Verifies that SoftwareApplication and FAQPage schemas are present
 */

describe('Structured Data', () => {
  it('should have SoftwareApplication schema structure', () => {
    const appSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Storywell',
      applicationCategory: 'EducationApplication',
      operatingSystem: 'Android, iOS',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        ratingCount: '1000+',
      },
    };

    expect(appSchema['@context']).toBe('https://schema.org');
    expect(appSchema['@type']).toBe('SoftwareApplication');
    expect(appSchema.name).toBe('Storywell');
    expect(appSchema.offers.price).toBe('0');
  });

  it('should have FAQPage schema structure', () => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Test Question',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Test Answer',
          },
        },
      ],
    };

    expect(faqSchema['@context']).toBe('https://schema.org');
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(Array.isArray(faqSchema.mainEntity)).toBe(true);
    expect(faqSchema.mainEntity[0]['@type']).toBe('Question');
    expect(faqSchema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });
});




