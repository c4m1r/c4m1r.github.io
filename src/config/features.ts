export const features = {
  news: true,
  currency: true,
} as const;

export type FeatureKey = keyof typeof features;

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return features[feature];
}
