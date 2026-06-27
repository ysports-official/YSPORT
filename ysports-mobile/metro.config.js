const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['mjs', ...config.resolver.sourceExts];
// Must be false: Firebase's package.json exports have no react-native condition,
// so unstable_enablePackageExports=true routes to the browser ESM bundle
// (no getReactNativePersistence). false lets Metro use @firebase/auth's
// react-native field → dist/rn/index.js (correct RN bundle).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
