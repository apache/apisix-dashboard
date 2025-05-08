import { queryOptions } from '@tanstack/react-query';

import { API_PROTOS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

export const getProtoListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['protos', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespProtoList']>(API_PROTOS, {
          params: {
            page,
            page_size: pageSize,
          },
        })
        .then((v) => v.data),
  });
};

export const getProtoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['proto', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespProtoDetail']>(`${API_PROTOS}/${id}`)
        .then((v) => v.data),
  });

export const putProtoReq = (data: APISIXType['Proto']) => {
  const { id, ...rest } = data;
  return req.put<APISIXType['Proto'], APISIXType['RespProtoDetail']>(
    `${API_PROTOS}/${id}`,
    rest
  );
};

export const postProtoReq = (data: APISIXType['ProtoPost']) => {
  return req.post<APISIXType['ProtoPost'], APISIXType['RespProtoList']>(
    API_PROTOS,
    data
  );
};
