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

import { getRouteListReq, getRouteReq } from '@/apis/routes';
import { getUpstreamListReq } from '@/apis/upstreams';
import { req } from '@/config/req';
import { type PageSearchType } from '@/types/schema/pageSearch';
import { useSearchParams } from '@/utils/useSearchParams';
import { useTablePagination } from '@/utils/useTablePagination';

import { getConsumerGroupListReq } from './consumer_groups';
import { getConsumerListReq } from './consumers';
import { getGlobalRuleListReq } from './global_rules';
import { getPluginConfigListReq } from './plugin_configs';
import { getProtoListReq } from './protos';
import { getSecretListReq } from './secrets';
import { getServiceListReq } from './services';
import { getSSLListReq } from './ssls';
import { getStreamRouteListReq } from './stream_routes';

export const getUpstreamListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['upstreams', props.page, props.page_size],
    queryFn: () => getUpstreamListReq(req, props),
  });
};

export const useUpstreamList = () => {
  const { params, setParams } = useSearchParams('/upstreams/');
  const upstreamQuery = useSuspenseQuery(getUpstreamListQueryOptions(params));
  const { data, isLoading, refetch } = upstreamQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getRouteListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['routes', props.page, props.page_size],
    queryFn: () => getRouteListReq(req, props),
  });
};

export const useRouteList = () => {
  const { params, setParams } = useSearchParams('/routes/');
  const routeQuery = useSuspenseQuery(getRouteListQueryOptions(params));
  const { data, isLoading, refetch } = routeQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getRouteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['route', id],
    queryFn: () => getRouteReq(req, id),
  });

export const getConsumerGroupListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['consumer_groups', props.page, props.page_size],
    queryFn: () => getConsumerGroupListReq(req, props),
  });
};

export const useConsumerGroupList = () => {
  const { params, setParams } = useSearchParams('/consumer_groups/');
  const consumerGroupQuery = useSuspenseQuery(
    getConsumerGroupListQueryOptions(params)
  );
  const { data, isLoading, refetch } = consumerGroupQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getStreamRouteListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['stream_routes', props.page, props.page_size],
    queryFn: () => getStreamRouteListReq(req, props),
  });
};

export const useStreamRouteList = () => {
  const { params, setParams } = useSearchParams('/stream_routes/');
  const streamRouteQuery = useSuspenseQuery(
    getStreamRouteListQueryOptions(params)
  );
  const { data, isLoading, refetch } = streamRouteQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getServiceListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['services', props.page, props.page_size],
    queryFn: () => getServiceListReq(req, props),
  });
};

export const useServiceList = () => {
  const { params, setParams } = useSearchParams('/services/');
  const serviceQuery = useSuspenseQuery(getServiceListQueryOptions(params));
  const { data, isLoading, refetch } = serviceQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

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

export const getPluginConfigListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['plugin_configs', props.page, props.page_size],
    queryFn: () => getPluginConfigListReq(req, props),
  });
};

export const usePluginConfigList = () => {
  const { params, setParams } = useSearchParams('/plugin_configs/');
  const pluginConfigQuery = useSuspenseQuery(
    getPluginConfigListQueryOptions(params)
  );
  const { data, isLoading, refetch } = pluginConfigQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getSSLListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['ssls', props.page, props.page_size],
    queryFn: () => getSSLListReq(req, props),
  });
};

export const useSSLList = () => {
  const { params, setParams } = useSearchParams('/ssls/');
  const sslQuery = useSuspenseQuery(getSSLListQueryOptions(params));
  const { data, isLoading, refetch } = sslQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getConsumerListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['consumers', props.page, props.page_size],
    queryFn: () => getConsumerListReq(req, props),
  });
};

export const useConsumerList = () => {
  const { params, setParams } = useSearchParams('/consumers/');
  const consumerQuery = useSuspenseQuery(getConsumerListQueryOptions(params));
  const { data, isLoading, refetch } = consumerQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getProtoListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['protos', props.page, props.page_size],
    queryFn: () => getProtoListReq(req, props),
  });
};

export const useProtoList = () => {
  const { params, setParams } = useSearchParams('/protos/');
  const protoQuery = useSuspenseQuery(getProtoListQueryOptions(params));
  const { data, isLoading, refetch } = protoQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};

export const getSecretListQueryOptions = (props: PageSearchType) => {
  return queryOptions({
    queryKey: ['secrets', props.page, props.page_size],
    queryFn: () => getSecretListReq(req, props),
  });
};

export const useSecretList = () => {
  const { params, setParams } = useSearchParams('/secrets/');
  const secretQuery = useSuspenseQuery(getSecretListQueryOptions(params));
  const { data, isLoading, refetch } = secretQuery;
  const pagination = useTablePagination({ data, setParams, params });
  return { data, isLoading, refetch, pagination };
};
