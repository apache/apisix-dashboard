import type { Resources } from '@/config/i18n';
import type { FileRouteTypes } from '@/routeTree.gen';

export type NavRoute = {
  to: FileRouteTypes['to'];
  label: keyof Resources['en']['common']['navbar'];
};
export const navRoutes: NavRoute[] = [
  {
    to: '/services',
    label: 'services',
  },
  {
    to: '/routes',
    label: 'routes',
  },
  {
    to: '/stream_routes',
    label: 'streamRoutes',
  },
  {
    to: '/upstreams',
    label: 'upstreams',
  },
  {
    to: '/consumers',
    label: 'consumers',
  },
  {
    to: '/ssls',
    label: 'ssls',
  },
  {
    to: '/global_rules',
    label: 'globalRules',
  },
  {
    to: '/plugin_metadata',
    label: 'pluginMetadata',
  },
  {
    to: '/plugin_configs',
    label: 'pluginConfigs',
  },
  {
    to: '/secrets',
    label: 'secrets',
  },
  {
    to: '/protos',
    label: 'protos',
  },
];
