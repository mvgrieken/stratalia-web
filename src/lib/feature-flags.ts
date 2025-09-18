import { logger } from '@/lib/logger';
/**
 * Feature flags configuration
 * Controls which features are enabled based on environment variables
 */

export interface FeatureFlags {
  ENABLE_QUIZ: boolean;
  ENABLE_LEADERBOARD: boolean;
  ENABLE_COMMUNITY: boolean;
  ENABLE_CHALLENGES: boolean;
  ENABLE_NOTIFICATIONS: boolean;
  ENABLE_AI_FEATURES: boolean;
  ENABLE_VOICE_SEARCH: boolean;
  ENABLE_ADMIN_PANEL: boolean;
}

function parseEnvBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

export const featureFlags: FeatureFlags = {
  ENABLE_QUIZ: parseEnvBoolean(process.env.ENABLE_QUIZ, true),
  ENABLE_LEADERBOARD: parseEnvBoolean(process.env.ENABLE_LEADERBOARD, true),
  ENABLE_COMMUNITY: parseEnvBoolean(process.env.ENABLE_COMMUNITY, true),
  ENABLE_CHALLENGES: parseEnvBoolean(process.env.ENABLE_CHALLENGES, true),
  ENABLE_NOTIFICATIONS: parseEnvBoolean(process.env.ENABLE_NOTIFICATIONS, true),
  ENABLE_AI_FEATURES: parseEnvBoolean(process.env.ENABLE_AI_FEATURES, true),
  ENABLE_VOICE_SEARCH: parseEnvBoolean(process.env.ENABLE_VOICE_SEARCH, true),
  ENABLE_ADMIN_PANEL: parseEnvBoolean(process.env.ENABLE_ADMIN_PANEL, true),
};

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Partial<FeatureFlags> {
  return Object.entries(featureFlags)
    .filter(([, enabled]) => enabled)
    .reduce((acc, [key, value]) => {
      acc[key as keyof FeatureFlags] = value;
      return acc;
    }, {} as Partial<FeatureFlags>);
}

/**
 * Development helper to log feature flag status
 */
if (process.env.NODE_ENV === 'development') {
  logger.debug(`🚩 Feature Flags Status: ${featureFlags}`);
}
