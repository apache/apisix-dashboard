import { API_SERVICES } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { queryOptions } from '@tanstack/react-query';

export type ServicePostType = APISIXType['ServicePost'];

export const getServiceListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['services', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespServiceList']>(API_SERVICES, {
          params: { page, page_size: pageSize },
        })
        .then((v) => v.data),
  });
};

export const getServiceQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['service', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespServiceDetail']>(`${API_SERVICES}/${id}`)
        .then((v) => v.data),
  });

export const putServiceReq = (data: APISIXType['Service']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Service'], APISIXType['RespServiceDetail']>(
    `${API_SERVICES}/${id}`,
    rest
  );
};

export const postServiceReq = (data: ServicePostType) =>
  req.post<ServicePostType, APISIXType['RespServiceDetail']>(
    API_SERVICES,
    data
  );
