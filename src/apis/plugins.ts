import {
  API_GLOBAL_RULES,
  API_PLUGINS,
  API_PLUGINS_LIST,
} from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions, skipToken } from '@tanstack/react-query';

export const putGlobalRuleReq = (data: A6Type['GlobalRulePut']) => {
  const { id, ...rest } = data;
  return req.put<A6Type['GlobalRulePut'], A6Type['RespGlobalRuleDetail']>(
    `${API_GLOBAL_RULES}/${id}`,
    rest
  );
};

export const getGlobalRuleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['global-rule', id],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespGlobalRuleDetail']>(
          `${API_GLOBAL_RULES}/${id}`
        )
        .then((v) => v.data),
  });

export type NeedPluginSchema = {
  schema: A6Type['PluginSchemaKeys'];
};

export const getPluginsListQueryOptions = (
  props: A6Type['PluginsQuery'] & NeedPluginSchema = { schema: 'normal' }
) => {
  const { subsystem, schema } = props;
  return queryOptions({
    queryKey: ['plugins-list', subsystem, schema],
    queryFn:
      schema === 'normal'
        ? () =>
            req
              .get<unknown, A6Type['RespPluginsList']>(API_PLUGINS_LIST)
              .then((v) => v.data)
        : // filter consumer_schema or metadata_schema plugins
          () =>
            req
              .get<unknown, A6Type['RespPlugins']>(API_PLUGINS, {
                params: { subsystem },
              })
              .then((v) => {
                const data = Object.entries(v.data);
                const list = [];
                for (const [name, config] of data) {
                  if (config[schema]) {
                    list.push(name);
                  }
                }
                return list;
              }),
  });
};

export const getPluginSchemaQueryOptions = (
  name: string,
  schema: A6Type['PluginSchemaKeys']
) => {
  return queryOptions({
    queryKey: ['plugin-schema', name, schema],
    queryFn: name
      ? () =>
          req
            .get<unknown, A6Type['RespPluginSchema']>(`${API_PLUGINS}/${name}`)
            .then((v) => (schema === 'normal' ? v.data : v.data[schema]))
      : skipToken,
  });
};
