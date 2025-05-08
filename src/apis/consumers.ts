import { queryOptions } from '@tanstack/react-query';

import { API_CONSUMERS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getConsumerListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['consumers', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespConsumerList']>(API_CONSUMERS, {
          params: { page, page_size: pageSize },
        })
        .then((v) => v.data),
  });
};

export const getConsumerQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ['consumer', username],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespConsumerDetail']>(`${API_CONSUMERS}/${username}`)
        .then((v) => v.data),
  });

export const putConsumerReq = (data: APISIXType['ConsumerPut']) => {
  return req.put<APISIXType['ConsumerPut'], APISIXType['RespConsumerDetail']>(
    API_CONSUMERS,
    data
  );
};
