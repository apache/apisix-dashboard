import { API_GLOBAL_RULES } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions } from '@tanstack/react-query';

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
