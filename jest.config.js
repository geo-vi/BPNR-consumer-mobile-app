module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|jotai|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens)/)',
  ],
};
