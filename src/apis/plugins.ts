import { API_GLOBAL_RULES } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions } from '@tanstack/react-query';

export const putGlobalRuleReq = (data: A6Type['GlobalRulePut']) =>
  req.put<A6Type['GlobalRulePut'], A6Type['RespGlobalRuleDetail']>(
    API_GLOBAL_RULES,
    data
  );

export const getGlobalRuleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['plugin-global-rule', id],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespGlobalRuleDetail']>(
          `${API_GLOBAL_RULES}/${id}`
        )
        .then((v) => v.data),
  });
