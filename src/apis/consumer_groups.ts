import { API_CONSUMER_GROUPS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { queryOptions } from '@tanstack/react-query';

export const getConsumerGroupListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['consumer_groups', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespConsumerGroupList']>(
          API_CONSUMER_GROUPS,
          {
            params: { page, page_size: pageSize },
          }
        )
        .then((v) => v.data),
  });
};

export const getConsumerGroupQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['consumer_group', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespConsumerGroupDetail']>(
          `${API_CONSUMER_GROUPS}/${id}`
        )
        .then((v) => v.data),
  });

export const putConsumerGroupReq = (data: APISIXType['ConsumerGroupPut']) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['ConsumerGroupPut'],
    APISIXType['RespConsumerGroupDetail']
  >(`${API_CONSUMER_GROUPS}/${id}`, rest);
};
