import { useAtomValue } from 'jotai';
import { appLanguageAtom } from '../state/i18n';
import { strings, type Strings } from './strings';
import type { AppLanguage } from './types';

export function useI18n(): { language: AppLanguage; strings: Strings } {
  const language = useAtomValue(appLanguageAtom);
  return { language, strings: strings[language] };
}

