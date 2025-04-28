import { API_PLUGINS, API_PLUGINS_LIST } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions, skipToken } from '@tanstack/react-query';

export const getPluginsListQueryOptions = (
  props: A6Type['PluginsQuery'] = {}
) => {
  const { all, subsystem } = props;
  return queryOptions({
    queryKey: ['plugins-list', all, subsystem],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespPluginsList']>(API_PLUGINS_LIST, {
          params: {
            all,
            subsystem,
          },
        })
        .then((v) => v.data),
  });
};

export const getPluginSchemaQueryOptions = (name: string) => {
  return queryOptions({
    queryKey: ['plugin-schema', name],
    queryFn: name
      ? () =>
          req
            .get<unknown, A6Type['RespPluginSchema']>(`${API_PLUGINS}/${name}`)
            .then((v) => v.data)
      : skipToken,
  });
};
