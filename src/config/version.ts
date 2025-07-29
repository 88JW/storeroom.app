// Import wersji z package.json
import packageJson from '../../package.json';

export const APP_VERSION = {
  version: packageJson.version,
  buildNumber: '2025.07.29.1',
  codeName: 'Storeroom PWA - Expiry Alerts System',
  releaseDate: '2025-07-29',
  environment: typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development'
};

export const getAppInfo = () => {
  return {
    ...APP_VERSION,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
};
