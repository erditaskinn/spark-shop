import en from './en.json';
import tr from './tr.json';
export type Language = 'en' | 'tr';
export const deviceLanguage = (): Language => typeof navigator !== 'undefined' && navigator.language.startsWith('tr') ? 'tr' : 'en';
export function translate(language: Language, key: string): string {
  return (language === 'tr' ? tr : en)[key as keyof typeof en] ?? en[key as keyof typeof en] ?? key;
}
