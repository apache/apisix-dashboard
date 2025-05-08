/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { queryOptions } from '@tanstack/react-query';

import { API_CREDENTIALS, SKIP_INTERCEPTOR_HEADER } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { APISIXListResponse } from '@/types/schema/apisix/type';

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

export const getCredentialQueryOptions = (username: string, id: string) =>
  queryOptions({
    queryKey: ['credential', username, id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespCredentialDetail']>(
          `${API_CREDENTIALS(username)}/${id}`
        )
        .then((v) => v.data),
  });

export const putCredentialReq = (
  data: APISIXType['CredentialPut'] & WithUsername
) => {
  const { username, id, ...rest } = data;
  return req.put<
    APISIXType['CredentialPut'],
    APISIXType['RespCredentialDetail']
  >(`${API_CREDENTIALS(username)}/${id}`, rest);
};
