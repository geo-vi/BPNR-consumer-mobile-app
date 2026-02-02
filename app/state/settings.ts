import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export type ThemeMode = 'system' | 'light' | 'dark';

const storage = createJSONStorage<any>(() => AsyncStorage);

export const themeModeAtom = atomWithStorage<ThemeMode>(
  'themeMode',
  'system',
  storage,
  { getOnInit: true },
);

export const useMockApiAtom = atomWithStorage<boolean>(
  'useMockApi',
  false,
  storage,
  { getOnInit: true },
);
