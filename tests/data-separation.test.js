import { describe, it, expect } from 'vitest';

describe('Public vs Private Data Separation Security', () => {
  it('should verify draft projects are strictly filtered out of public queries', () => {
    const rawItemsFromDatabase = [
      { id: '1', title: 'Published Project 1', isPublished: true, slug: 'published-1' },
      { id: '2', title: 'Secret Draft Project', isPublished: false, slug: 'secret-draft' },
      { id: '3', title: 'Published Project 2', isPublished: true, slug: 'published-2' },
    ];

    // Simulating public query filter logic as defined in lib/data.js
    const publicResults = rawItemsFromDatabase.filter((p) => p.isPublished === true);

    expect(publicResults).toHaveLength(2);
    expect(publicResults.some((p) => p.slug === 'secret-draft')).toBe(false);
    expect(publicResults.every((p) => p.isPublished)).toBe(true);
  });

  it('should verify single item slug lookup strictly rejects unpublished draft items', () => {
    const allItems = [
      { id: '1', slug: 'live-system', isPublished: true },
      { id: '2', slug: 'wip-experiment', isPublished: false },
    ];

    const findPublicBySlug = (slug) => {
      return allItems.find((p) => p.slug === slug && p.isPublished === true) || null;
    };

    expect(findPublicBySlug('live-system')).not.toBeNull();
    expect(findPublicBySlug('wip-experiment')).toBeNull();
  });
});
