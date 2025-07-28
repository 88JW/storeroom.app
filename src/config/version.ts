// Import wersji z package.json
import packageJson from '../../package.json';

export const APP_VERSION = {
  version: packageJson.version,
  buildNumber: '2025.01.28.2',
  codeName: 'Storeroom PWA - Auth Complete',
  releaseDate: '2025-01-28',
  environment: process.env.NODE_ENV || 'development'
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
