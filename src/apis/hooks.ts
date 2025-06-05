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
import { getUpstreamListReq, getUpstreamReq } from '@/apis/upstreams';
import { req } from '@/config/req';
import type {
  APISIXDetailResponse,
  APISIXListResponse,
} from '@/types/schema/apisix/type';
import { type PageSearchType } from '@/types/schema/pageSearch';
import { useSearchParams } from '@/utils/useSearchParams';
import {
  type ListPageKeys,
  useTablePagination,
} from '@/utils/useTablePagination';

import {
  getConsumerGroupListReq,
  getConsumerGroupReq,
} from './consumer_groups';
import { getConsumerListReq, getConsumerReq } from './consumers';
import { getCredentialListReq, getCredentialReq } from './credentials';
import { getGlobalRuleListReq, getGlobalRuleReq } from './global_rules';
import { getPluginConfigListReq, getPluginConfigReq } from './plugin_configs';
import { getProtoListReq, getProtoReq } from './protos';
import { getSecretListReq, getSecretReq } from './secrets';
import { getServiceListReq, getServiceReq } from './services';
import { getSSLListReq, getSSLReq } from './ssls';
import { getStreamRouteListReq, getStreamRouteReq } from './stream_routes';

const genDetailQueryOptions =
  <T extends unknown[], R>(
    key: string,
    getDetailReq: (
      req: AxiosInstance,
      ...args: T
    ) => Promise<APISIXDetailResponse<R>>
  ) =>
  (...args: T) => {
    return queryOptions({
      queryKey: [key, ...args],
      queryFn: () => getDetailReq(req, ...args),
    });
  };
/** simple factory func for list query options which support extends PageSearchType */
const genListQueryOptions =
  <P extends PageSearchType, R>(
    key: string,
    listReq: (req: AxiosInstance, props: P) => Promise<APISIXListResponse<R>>
  ) =>
  (props: P) => {
    return queryOptions({
      queryKey: [key, props],
      queryFn: () => listReq(req, props),
    });
  };

/** simple hook factory func for list hooks which support extends PageSearchType */
export const genUseList = <
  T extends ListPageKeys,
  U extends ListPageKeys,
  P extends PageSearchType,
  R
>(
  routeKey: T,
  listQueryOptions: ReturnType<typeof genListQueryOptions<P, R>>
) => {
  return (replaceKey?: U) => {
    const key = replaceKey || routeKey;
    const { params, setParams } = useSearchParams<T | U, P>(key);
    const listQuery = useSuspenseQuery(listQueryOptions(params));
    const { data, isLoading, refetch } = listQuery;
    const opts = { data, setParams, params };
    const pagination = useTablePagination(opts);
    return { data, isLoading, refetch, pagination };
  };
};

export type UseListReturn<
  T extends ListPageKeys,
  U extends ListPageKeys,
  P extends PageSearchType,
  R
> = ReturnType<ReturnType<typeof genUseList<T, U, P, R>>>;

export const getUpstreamQueryOptions = genDetailQueryOptions(
  'upstream',
  getUpstreamReq
);
export const getUpstreamListQueryOptions = genListQueryOptions(
  'upstreams',
  getUpstreamListReq
);
export const useUpstreamList = genUseList(
  '/upstreams/',
  getUpstreamListQueryOptions
);

export const getRouteQueryOptions = genDetailQueryOptions('route', getRouteReq);
export const getRouteListQueryOptions = genListQueryOptions(
  'routes',
  getRouteListReq
);
export const useRouteList = genUseList('/routes/', getRouteListQueryOptions);

export const getConsumerGroupQueryOptions = genDetailQueryOptions(
  'consumer_group',
  getConsumerGroupReq
);
export const getConsumerGroupListQueryOptions = genListQueryOptions(
  'consumer_groups',
  getConsumerGroupListReq
);
export const useConsumerGroupList = genUseList(
  '/consumer_groups/',
  getConsumerGroupListQueryOptions
);

export const getStreamRouteQueryOptions = genDetailQueryOptions(
  'stream_route',
  getStreamRouteReq
);
export const getStreamRouteListQueryOptions = genListQueryOptions(
  'stream_routes',
  getStreamRouteListReq
);
export const useStreamRouteList = genUseList(
  '/stream_routes/',
  getStreamRouteListQueryOptions
);

export const getServiceQueryOptions = genDetailQueryOptions(
  'service',
  getServiceReq
);
export const getServiceListQueryOptions = genListQueryOptions(
  'services',
  getServiceListReq
);
export const useServiceList = genUseList(
  '/services/',
  getServiceListQueryOptions
);

export const getGlobalRuleQueryOptions = genDetailQueryOptions(
  'global_rule',
  getGlobalRuleReq
);
export const getGlobalRuleListQueryOptions = genListQueryOptions(
  'global_rules',
  getGlobalRuleListReq
);
export const useGlobalRuleList = genUseList(
  '/global_rules/',
  getGlobalRuleListQueryOptions
);

export const getPluginConfigQueryOptions = genDetailQueryOptions(
  'plugin_config',
  getPluginConfigReq
);
export const getPluginConfigListQueryOptions = genListQueryOptions(
  'plugin_configs',
  getPluginConfigListReq
);
export const usePluginConfigList = genUseList(
  '/plugin_configs/',
  getPluginConfigListQueryOptions
);

export const getSSLQueryOptions = genDetailQueryOptions('ssl', getSSLReq);
export const getSSLListQueryOptions = genListQueryOptions('ssls', getSSLListReq);
export const useSSLList = genUseList('/ssls/', getSSLListQueryOptions);

export const getConsumerQueryOptions = genDetailQueryOptions(
  'consumer',
  getConsumerReq
);
export const getConsumerListQueryOptions = genListQueryOptions(
  'consumers',
  getConsumerListReq
);
export const useConsumerList = genUseList(
  '/consumers/',
  getConsumerListQueryOptions
);

export const getCredentialQueryOptions = genDetailQueryOptions(
  'credential',
  getCredentialReq
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

export const getProtoQueryOptions = genDetailQueryOptions('proto', getProtoReq);
export const getProtoListQueryOptions = genListQueryOptions('protos', getProtoListReq);
export const useProtoList = genUseList('/protos/', getProtoListQueryOptions);

export const getSecretQueryOptions = genDetailQueryOptions(
  'secret',
  getSecretReq
);
export const getSecretListQueryOptions = genListQueryOptions(
  'secrets',
  getSecretListReq
);
export const useSecretList = genUseList('/secrets/', getSecretListQueryOptions);
