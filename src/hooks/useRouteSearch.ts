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
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListReq, type WithServiceIdFilter } from '@/apis/routes';
import { req } from '@/config/req';

export function useRouteSearch(
  keyword: string,
  listParams: Partial<WithServiceIdFilter>
) {
  const { t, i18n } = useTranslation();
  const searchText = keyword.trim();
  const term = searchText.toLowerCase();
  const active = term.length > 0;
  const filters = { ...listParams };
  delete filters.page;
  delete filters.page_size;

  // The keyword stays out of the query key so typing reuses the same list.
  const query = useQuery({
    queryKey: ['routes', 'search', filters],
    queryFn: async ({ signal }) => {
      const { list } = await getRouteListReq(req, filters, signal);
      // Keep the same order as the paginated list.
      return (list ?? []).sort((a, b) => a.createdIndex - b.createdIndex);
    },
    enabled: active,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });

  const compareStatusLabel = new Intl.Collator(i18n.resolvedLanguage, {
    usage: 'search',
    sensitivity: 'accent',
  }).compare;
  const searchedStatus = [
    { value: 1, label: t('table.enabled') },
    { value: 0, label: t('table.disabled') },
  ].find(({ label }) => compareStatusLabel(searchText, label) === 0)?.value;

  const matches = useMemo(() => {
    if (!term || query.isError) return [];
    return (query.data ?? []).filter(({ value: route }) => {
      const fields = [
        route.name,
        route.uri,
        ...(route.uris ?? []),
        route.host,
        ...(route.hosts ?? []),
        route.desc,
        ...Object.keys(route.plugins ?? {}),
        ...Object.entries(route.labels ?? {}).map(([key, value]) => `${key}=${value}`),
      ];
      return (
        searchedStatus === (route.status ?? 1) ||
        fields.some((field) => field?.toLowerCase().includes(term))
      );
    });
  }, [term, query.data, query.isError, searchedStatus]);

  return { active, matches, query };
}
