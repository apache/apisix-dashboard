import { queryOptions } from '@tanstack/react-query';

import { API_SECRETS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

/**
 * `manager` does not exist in apisix secret, we parse it from `id`
 * `id` (origin) is `manager/id`, we convert it to `id` and `manager`
 */
export const preParseSecretItem = <T extends APISIXType['RespSecretItem']>(
  data: T
) => {
  const { id } = data.value;
  if (!id) return data;
  type IDTuple = [APISIXType['Secret']['manager'], string];
  const idTuple = id.split('/') as IDTuple;
  if (idTuple.length !== 2) return data;
  const [manager, realId] = idTuple;
  return { ...data, value: { ...data.value, manager, id: realId } };
};

export const getSecretListQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['secrets', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespSecretList']>(API_SECRETS, {
          params: { page, page_size: pageSize },
        })
        .then((v) => {
          const { list, ...rest } = v.data;
          return {
            ...rest,
            list: list.map(preParseSecretItem),
          };
        }),
  });
};

export const getSecretQueryOptions = (
  props: Pick<APISIXType['Secret'], 'id' | 'manager'>
) => {
  const { id, manager } = props;
  return queryOptions({
    queryKey: ['secret', manager, id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${id}`
        )
        .then((v) => preParseSecretItem(v.data)),
  });
};

export const putSecretReq = (data: APISIXType['Secret']) => {
  const { manager, id, ...rest } = data;
  return req.put<APISIXType['Secret'], APISIXType['RespSecretDetail']>(
    `${API_SECRETS}/${manager}/${id}`,
    rest
  );
};
