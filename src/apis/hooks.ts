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
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';

import { getRouteListReq, getRouteReq } from '@/apis/routes';
import { getUpstreamListReq } from '@/apis/upstreams';
import { req } from '@/config/req';
import type { APISIXListResponse } from '@/types/schema/apisix/type';
import { type PageSearchType } from '@/types/schema/pageSearch';
import { useSearchParams } from '@/utils/useSearchParams';
import {
  type ListPageKeys,
  useTablePagination,
} from '@/utils/useTablePagination';

import { getConsumerGroupListReq } from './consumer_groups';
import { getConsumerListReq } from './consumers';
import { getCredentialListReq } from './credentials';
import { getGlobalRuleListReq } from './global_rules';
import { getPluginConfigListReq } from './plugin_configs';
import { getProtoListReq } from './protos';
import { getSecretListReq } from './secrets';
import { getServiceListReq } from './services';
import { getSSLListReq } from './ssls';
import { getStreamRouteListReq } from './stream_routes';

/**
 * simple factory func for list query options which support PageSearchType
 * currently only support page and page_size
 */
const genListQueryOptions =
  <T, P extends PageSearchType>(
    key: string,
    listReq: (req: AxiosInstance, props: P) => Promise<APISIXListResponse<T>>
  ) =>
  (props: P) => {
    return queryOptions({
      queryKey: [key, ...Object.values(props)],
      queryFn: () => listReq(req, props),
    });
  };

/** simple hook factory func for list hooks which support PageSearchType */
export const genUseList = <T extends ListPageKeys, U, P extends PageSearchType>(
  routeId: T,
  listQueryOptions: ReturnType<typeof genListQueryOptions<U, P>>
) => {
  return () => {
    const { params, setParams } = useSearchParams<T, P>(routeId);
    const listQuery = useSuspenseQuery(listQueryOptions(params));
    const { data, isLoading, refetch } = listQuery;
    const pagination = useTablePagination({
      data,
      setParams,
      params,
    });
    return { data, isLoading, refetch, pagination };
  };
};

export const getUpstreamListQueryOptions = genListQueryOptions(
  'upstreams',
  getUpstreamListReq
);

export const useUpstreamList = genUseList(
  '/upstreams/',
  getUpstreamListQueryOptions
);

export const getRouteListQueryOptions = genListQueryOptions(
  'routes',
  getRouteListReq
);

export const useRouteList = genUseList('/routes/', getRouteListQueryOptions);

export const getRouteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['route', id],
    queryFn: () => getRouteReq(req, id),
  });

export const getConsumerGroupListQueryOptions = genListQueryOptions(
  'consumer_groups',
  getConsumerGroupListReq
);

export const useConsumerGroupList = genUseList(
  '/consumer_groups/',
  getConsumerGroupListQueryOptions
);

export const getStreamRouteListQueryOptions = genListQueryOptions(
  'stream_routes',
  getStreamRouteListReq
);

export const useStreamRouteList = genUseList(
  '/stream_routes/',
  getStreamRouteListQueryOptions
);

export const getServiceListQueryOptions = genListQueryOptions(
  'services',
  getServiceListReq
);

export const useServiceList = genUseList(
  '/services/',
  getServiceListQueryOptions
);

export const getGlobalRuleListQueryOptions = () => {
  return queryOptions({
    queryKey: ['global_rules'],
    queryFn: () => getGlobalRuleListReq(req),
  });
};

export const useGlobalRuleList = () => {
  const globalRuleQuery = useSuspenseQuery(getGlobalRuleListQueryOptions());
  const { data, isLoading, refetch } = globalRuleQuery;
  return { data, isLoading, refetch };
};

export const getPluginConfigListQueryOptions = genListQueryOptions(
  'plugin_configs',
  getPluginConfigListReq
);

export const usePluginConfigList = genUseList(
  '/plugin_configs/',
  getPluginConfigListQueryOptions
);

export const getSSLListQueryOptions = genListQueryOptions(
  'ssls',
  getSSLListReq
);

export const useSSLList = genUseList('/ssls/', getSSLListQueryOptions);

export const getConsumerListQueryOptions = genListQueryOptions(
  'consumers',
  getConsumerListReq
);

export const useConsumerList = genUseList(
  '/consumers/',
  getConsumerListQueryOptions
);

export const getCredentialListQueryOptions = (username: string) => {
  return queryOptions({
    queryKey: ['credentials', username],
    queryFn: () => getCredentialListReq(req, { username }),
  });
};

export const useCredentialsList = (username: string) => {
  const credentialQuery = useSuspenseQuery(
    getCredentialListQueryOptions(username)
  );
  const { data, isLoading, refetch } = credentialQuery;
  return { data, isLoading, refetch };
};

export const getProtoListQueryOptions = genListQueryOptions(
  'protos',
  getProtoListReq
);

export const useProtoList = genUseList('/protos/', getProtoListQueryOptions);

export const getSecretListQueryOptions = genListQueryOptions(
  'secrets',
  getSecretListReq
);

export const useSecretList = genUseList('/secrets/', getSecretListQueryOptions);
