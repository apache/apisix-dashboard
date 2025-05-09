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
