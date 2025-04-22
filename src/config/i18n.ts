import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import en_common from '@/locales/en/common.json';
import zh_common from '@/locales/zh/common.json';

export const resources = {
  en: {
    common: en_common,
  },
  zh: {
    common: zh_common,
  },
} as const;

export type Resources = typeof resources;
export const defaultNS: keyof Resources['en'] = 'common';

i18n.use(initReactI18next).init({
  lng: 'en',
  ns: ['common'],
  defaultNS,
  resources,
});

export default i18n;
