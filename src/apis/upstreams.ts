import { API_UPSTREAMS } from '@/config/constant';
import { req } from '@/config/req';
import type { A6Type } from '@/types/schema/apisix';
import { queryOptions } from '@tanstack/react-query';

export const getUpstreamReq = (id: string) =>
  queryOptions({
    queryKey: ['upstream', id],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespUpstreamDetail']>(`${API_UPSTREAMS}/${id}`)
        .then((v) => v.data),
  });

export const putUpstreamReq = (data: A6Type['Upstream']) => {
  const { id, ...rest } = data;
  return req.put<A6Type['Upstream'], A6Type['RespGlobalRuleDetail']>(
    `${API_UPSTREAMS}/${id}`,
    rest
  );
};
