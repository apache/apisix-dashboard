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

import { API_SERVICES } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import type { PageSearchType } from '@/types/schema/pageSearch';

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
