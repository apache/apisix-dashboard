import type { Resources } from '@/config/i18n';
import type { FileRouteTypes } from '@/routeTree.gen';

export type NavRoute = {
  to: FileRouteTypes['to'];
  label: keyof Resources['en']['common']['navbar'];
};
export const navRoutes: NavRoute[] = [
  {
    to: '/service',
    label: 'service',
  },
  {
    to: '/route',
    label: 'route',
  },
  {
    to: '/consumer',
    label: 'consumer',
  },
  {
    to: '/ssl',
    label: 'ssl',
  },
  {
    to: '/plugin-global-rules',
    label: 'pluginGlobalRules',
  },
  {
    to: '/secret',
    label: 'secret',
  },
];
