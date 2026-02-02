import type { LinkingOptions } from '@react-navigation/native';
import type { RootTabParamList } from './types';

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['bpnr://'],
  config: {
    screens: {
      Home: 'home',
      Transactions: 'txns',
      Requests: 'requests',
      Documents: 'documents',
      Settings: 'settings',
    },
  },
};
