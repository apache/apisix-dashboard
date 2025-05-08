import { queryOptions } from '@tanstack/react-query';

import { API_PLUGIN_CONFIGS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getPluginConfigListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['plugin_configs', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespPluginConfigList']>(API_PLUGIN_CONFIGS, {
          params: { page, page_size: pageSize },
        })
        .then((v) => v.data),
  });
};

export const getPluginConfigQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['plugin_config', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespPluginConfigDetail']>(
          `${API_PLUGIN_CONFIGS}/${id}`
        )
        .then((v) => v.data),
  });

export const putPluginConfigReq = (data: APISIXType['PluginConfigPut']) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['PluginConfigPut'],
    APISIXType['RespPluginConfigDetail']
  >(`${API_PLUGIN_CONFIGS}/${id}`, rest);
};
