import { API_UPSTREAMS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { queryOptions } from '@tanstack/react-query';

export const getUpstreamReq = (id: string) =>
  queryOptions({
    queryKey: ['upstream', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespUpstreamDetail']>(
          `${API_UPSTREAMS}/${id}`
        )
        .then((v) => v.data),
  });

export const putUpstreamReq = (data: APISIXType['Upstream']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Upstream'], APISIXType['RespUpstreamDetail']>(
    `${API_UPSTREAMS}/${id}`,
    rest
  );
};
