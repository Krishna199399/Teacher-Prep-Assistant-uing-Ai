const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Handle ESM imports for MUI packages
      webpackConfig.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx', '.jsx'],
        '.jsx': ['.jsx', '.tsx'],
        '.mjs': ['.mjs', '.js', '.ts']
      };
      
      // Disable the fullySpecified flag for MUI packages
      webpackConfig.module.rules.push({
        test: /\.(js|mjs)$/,
        include: /node_modules[\/\\](@mui|@babel)/,
        resolve: {
          fullySpecified: false
        }
      });
      
      return webpackConfig;
    }
  }
}; 