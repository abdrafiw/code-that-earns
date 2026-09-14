export const UI_UX_DESIGN_CATEGORY = 'UI/UX Design';

export const CHALLENGE_CATEGORIES = [
  'Coding',
  'Data Analysis',
  'Blockchain',
  UI_UX_DESIGN_CATEGORY,
] as const;

export function isDesignChallenge(category?: string) {
  return category === UI_UX_DESIGN_CATEGORY;
}
