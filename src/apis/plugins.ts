import { API_PLUGIN_GLOBAL_RULES } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions } from '@tanstack/react-query';

export const putPluginGlobalRuleReq = (data: A6Type['PluginGlobalRulePut']) =>
  req.put<A6Type['PluginGlobalRulePut'], A6Type['RespPluginGlobalRuleDetail']>(
    API_PLUGIN_GLOBAL_RULES,
    data
  );

export const getPluginGlobalRuleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['plugin-global-rule', id],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespPluginGlobalRuleDetail']>(
          `${API_PLUGIN_GLOBAL_RULES}/${id}`
        )
        .then((v) => v.data),
  });
