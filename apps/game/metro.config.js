const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure React is resolved as a singleton to prevent duplicate bundling
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force react and react-dom to always resolve from the root to avoid duplicates
  if (moduleName === 'react' || moduleName === 'react-dom' || moduleName === 'react-dom/client') {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.join(__dirname, 'package.json'),
      },
      moduleName,
      platform
    );
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Enable symlinks to ensure pnpm packages resolve correctly
config.resolver.unstable_enableSymlinks = true;

// Ensure nodeModulesPaths includes the root node_modules for monorepo resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

module.exports = config;
