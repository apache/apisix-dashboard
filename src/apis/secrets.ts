import { API_SECRETS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';
import { diffPatch } from '@/utils/diffPatch';
import { queryOptions } from '@tanstack/react-query';
import { omit } from 'rambdax';

/**
 * in fact, `manager` not exist in apisix secret, we need to parse it from id
 */
export const preParseSecretItem = <T extends APISIXType['RespSecretItem']>(
  data: T
) => {
  const { id } = data.value;
  if (!id) return data;
  type IDTuple = [APISIXType['Secret']['manager'], string];
  const idTuple = id.split('/') as IDTuple;
  if (idTuple.length !== 2) return data;
  const [manager] = idTuple;
  return { ...data, value: { ...data.value, manager } };
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

export const getSecretQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['secret', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespSecretDetail']>(`${API_SECRETS}/${id}`)
        .then((v) => preParseSecretItem(v.data)),
  });

export const putSecretReq = (data: APISIXType['Secret']) => {
  const { manager, ...rest } = data;
  return req.put<APISIXType['Secret'], APISIXType['RespSecretDetail']>(
    `${API_SECRETS}/${manager}`,
    rest
  );
};

export const patchSecretReq = (
  oldData: APISIXType['Secret'],
  newData: APISIXType['Secret']
) => {
  const { id, ...rest } = omit(['manager'], diffPatch(oldData, newData));
  return req.patch<APISIXType['Secret'], APISIXType['RespSecretDetail']>(
    `${API_SECRETS}/${id}`,
    rest
  );
};
