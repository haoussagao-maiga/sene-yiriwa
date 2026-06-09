/**
 * Configuration Babel pour i18n
 */

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Support pour les imports dynamiques
    '@babel/plugin-syntax-dynamic-import',
  ],
};