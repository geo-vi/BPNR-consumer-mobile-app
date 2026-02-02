import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage<number>(() => AsyncStorage);

export const counterAtom = atomWithStorage<number>('counter', 0, storage, {
  getOnInit: true,
});
