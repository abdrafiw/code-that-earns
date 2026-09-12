export function normalizeChallengeFilter(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, ' ').trim();
}

export function createChallengeSearchTerms(...values: string[]) {
  const terms = new Set<string>();

  values.forEach((value, valueIndex) => {
    const normalized = normalizeChallengeFilter(value);
    const searchableValues = [
      ...normalized.split(/\s+/),
      ...(valueIndex === 0 ? [normalized.slice(0, 80)] : []),
    ];

    searchableValues.forEach((searchableValue) => {
      for (
        let index = 1;
        index <= Math.min(searchableValue.length, 80);
        index += 1
      ) {
        terms.add(searchableValue.slice(0, index));
      }
    });
  });

  return Array.from(terms).slice(0, 100);
}

export function createChallengeFilterFacets(
  category: string,
  difficulty: string,
) {
  return [
    `category:${category}`,
    `difficulty:${difficulty}`,
    `category:${category}|difficulty:${difficulty}`,
  ];
}

export function getChallengeFilterFacet(
  category?: string,
  difficulty?: string,
) {
  const hasCategory = Boolean(category && category !== 'all');
  const hasDifficulty = Boolean(difficulty && difficulty !== 'all');
  if (hasCategory && hasDifficulty)
    return `category:${category}|difficulty:${difficulty}`;
  if (hasCategory) return `category:${category}`;
  if (hasDifficulty) return `difficulty:${difficulty}`;
  return null;
}
export const CHALLENGE_SEARCH_SCHEMA_VERSION = 1;
