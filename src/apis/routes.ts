import type { RoutePostType } from '@/components/form-slice/FormPartRoute/schema';
import { API_ROUTES } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { queryOptions } from '@tanstack/react-query';

export const getRouteListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['routes', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespRouteList']>(API_ROUTES, {
          params: { page, page_size: pageSize },
        })
        .then((v) => v.data),
  });
};

export const postRouteReq = (data: RoutePostType) =>
  req.post<unknown, APISIXType['RespRouteDetail']>(API_ROUTES, data);
