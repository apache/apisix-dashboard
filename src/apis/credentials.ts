import { API_CREDENTIALS, SKIP_INTERCEPTOR_HEADER } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { APISIXListResponse } from '@/types/schema/apisix/type';
import { queryOptions } from '@tanstack/react-query';

type WithUsername = Pick<APISIXType['Consumer'], 'username'>;
export const getCredentialListQueryOptions = (props: WithUsername) => {
  const { username } = props;
  return queryOptions({
    queryKey: ['credentials', username],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespCredentialList']>(
          API_CREDENTIALS(username),
          {
            headers: {
              [SKIP_INTERCEPTOR_HEADER]: ['404'],
            },
          }
        )
        .then((v) => v.data)
        .catch((e) => {
          // 404 means credentials is empty
          if (e.response.status === 404) {
            const res: APISIXListResponse<APISIXType['Credential']> = {
              total: 0,
              list: [],
            };
            return res;
          }
          throw e;
        }),
  });
};

export const putCredentialReq = (
  data: APISIXType['CredentialPut'] & WithUsername
) => {
  const { username, id, ...rest } = data;
  return req.put<
    APISIXType['CredentialPut'],
    APISIXType['RespCredentialDetail']
  >(`${API_CREDENTIALS(username)}/${id}`, rest);
};
