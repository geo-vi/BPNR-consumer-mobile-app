/* eslint-env jest, es2020 */

globalThis.__RN_JEST__ = true;

import 'react-native-gesture-handler/jestSetup';
import AxiosMockAdapter from 'axios-mock-adapter';
import { apiClient } from './app/services/apiClient';
import { registerDefaultApiMocks } from './app/services/apiMocks';

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

jest.mock('@callstack/liquid-glass', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    isLiquidGlassSupported: false,
    LiquidGlassView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    LiquidGlassContainerView: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-gifted-charts', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createMock = name => {
    const Mock = ({ children, style }) =>
      React.createElement(View, { testID: name, style }, children);
    Mock.displayName = name;
    return Mock;
  };

  return {
    BarChart: createMock('BarChart'),
    LineChart: createMock('LineChart'),
    PieChart: createMock('PieChart'),
    PopulationPyramid: createMock('PopulationPyramid'),
    RadarChart: createMock('RadarChart'),
    BubbleChart: createMock('BubbleChart'),
  };
});

jest.mock('@mhpdev/react-native-haptics', () => ({
  __esModule: true,
  default: {
    impact: jest.fn(() => Promise.resolve()),
    notification: jest.fn(() => Promise.resolve()),
    selection: jest.fn(() => Promise.resolve()),
    androidHaptics: jest.fn(() => Promise.resolve()),
  },
}));

// Default axios mocks for unit tests (no real network).
const axiosMock = new AxiosMockAdapter(apiClient, { onNoMatch: 'throwException' });
globalThis.__BPNR_AXIOS_MOCK__ = axiosMock;
globalThis.__BPNR_USE_API_MOCKS__ = true;

registerDefaultApiMocks(axiosMock);
