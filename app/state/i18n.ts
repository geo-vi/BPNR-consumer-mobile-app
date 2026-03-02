import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import type { AppLanguage } from '../i18n/types';

const storage = createJSONStorage<any>(() => AsyncStorage);

export const appLanguageAtom = atomWithStorage<AppLanguage>(
  'appLanguage',
  'bg',
  storage,
  { getOnInit: true },
);

