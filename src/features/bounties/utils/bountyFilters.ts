export function normalizeBountyFilter(value: string) {
  return value.toLowerCase().replace(/[-_]+/g, ' ').trim();
}

export function createBountySearchTerms(...values: string[]) {
  const terms = new Set<string>();

  values.forEach((value, valueIndex) => {
    const normalized = normalizeBountyFilter(value);
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

  return Array.from(terms);
}
