import { Resources, defaultNS } from '@/locales/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: Resources['en'];
  }
}
