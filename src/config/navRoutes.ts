import i18n from '../locales/i18n';
import { FileRouteTypes } from '../routeTree.gen';

export type NavRoute = {
  to: FileRouteTypes['to'];
  label: string;
};
export const navRoutes: NavRoute[] = [
  {
    to: '/service',
    label: i18n.t('navbar.service'),
  },
  {
    to: '/route',
    label: i18n.t('navbar.route'),
  },
  {
    to: '/consumer',
    label: i18n.t('navbar.consumer'),
  },
  {
    to: '/ssl',
    label: i18n.t('navbar.ssl'),
  },
  {
    to: '/plugin-global-rules',
    label: i18n.t('navbar.pluginGlobalRules'),
  },
  {
    to: '/secret',
    label: i18n.t('navbar.secret'),
  },
];
