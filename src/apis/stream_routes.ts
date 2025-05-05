import { API_STREAM_ROUTES } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { queryOptions } from '@tanstack/react-query';

export const getStreamRouteListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['stream_routes', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespStreamRouteList']>(API_STREAM_ROUTES, {
          params: { page, page_size: pageSize },
        })
        .then((v) => v.data),
  });
};

export const getStreamRouteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['stream_route', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespStreamRouteDetail']>(
          `${API_STREAM_ROUTES}/${id}`
        )
        .then((v) => v.data),
  });

export const putStreamRouteReq = (data: APISIXType['StreamRoute']) => {
  const { id, ...rest } = data;
  return req.put<
    APISIXType['StreamRoute'],
    APISIXType['RespStreamRouteDetail']
  >(`${API_STREAM_ROUTES}/${id}`, rest);
};

export const postStreamRouteReq = (
  data: Omit<APISIXType['StreamRoute'], 'id'>
) =>
  req.post<unknown, APISIXType['RespStreamRouteDetail']>(
    API_STREAM_ROUTES,
    data
  );
