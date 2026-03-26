/**
 * Environment variable validation
 * Called during app bootstrap to fail fast on missing config
 */
export function validateEnv(config: Record<string, unknown>) {
  const required = ['DATABASE_URL']

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  return config
}
