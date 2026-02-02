/* eslint-env jest, es2020 */

globalThis.__RN_JEST__ = true;

import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const actual = jest.requireActual('react-native-gesture-handler');

  return {
    ...actual,
    GestureHandlerRootView: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
