const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Firebase v10 uses package.json exports — Metro needs this to resolve correctly
config.resolver.unstable_enablePackageExports = true;
module.exports = config;
