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

import { getUpstreamListReq } from '@/apis/upstreams';
import { req } from '@/config/req';
import { type PageSearchType } from '@/types/schema/pageSearch';
import { useSearchParams } from '@/utils/useSearchParams';
import { useTablePagination } from '@/utils/useTablePagination';

import { getRouteListReq, getRouteReq } from './routes';

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
