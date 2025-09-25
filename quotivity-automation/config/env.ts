export type EnvName = 'dev' | 'staging' | 'prod';

interface EnvConfig {
  apiUrl: string;
  appUrl: string;
}

const envs: Record<EnvName, EnvConfig> = {
  dev: {
    apiUrl: 'https://dev.quote.hapily.com',
    appUrl: 'https://dev-app.quote.hapily.com'
  },
  staging: {
    apiUrl: 'https://staging.quote.hapily.com',
    appUrl: 'https://staging-app.quote.hapily.com'
  },
  prod: {
    apiUrl: 'https://quote.hapily.com',
    appUrl: 'https://app.quote.hapily.com'
  }
};

// pick from CLI or default staging
const currentEnv = (process.env.TEST_ENV as EnvName) || 'staging';

export const config = envs[currentEnv];
