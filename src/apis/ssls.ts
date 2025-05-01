import { API_SSLS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { queryOptions } from '@tanstack/react-query';

export const getSSLListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['ssls', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespSSLList']>(API_SSLS, {
          params: {
            page,
            page_size: pageSize,
          },
        })
        .then((v) => v.data),
  });
};

export const getSSLDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['ssl', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespSSLDetail']>(`${API_SSLS}/${id}`)
        .then((v) => v.data),
  });

export const putSSLReq = (data: APISIXType['SSL']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['SSL'], APISIXType['RespSSLDetail']>(
    `${API_SSLS}/${id}`,
    rest
  );
};
