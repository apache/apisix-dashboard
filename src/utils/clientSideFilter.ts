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
import { STATUS_ALL } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

import type { SearchFormValues } from '../components/form/SearchForm';

/**
 * Client-side filtering utility for routes
 * Used as a fallback when backend doesn't support certain filter parameters
 */

export const filterRoutes = (
  routes: APISIXType['RespRouteItem'][],
  filters: SearchFormValues
): APISIXType['RespRouteItem'][] => {
  return routes.filter((route) => {
    const routeData = route.value;

    // Filter by name
    if (filters.name) {
      const nameMatch = routeData.name
        ?.toLowerCase()
        .includes(filters.name.toLowerCase());
      if (!nameMatch) return false;
    }

    // Filter by ID
    if (filters.id) {
      const idMatch = String(routeData.id)
        .toLowerCase()
        .includes(filters.id.toLowerCase());
      if (!idMatch) return false;
    }

    // Filter by host
    if (filters.host) {
      const host = Array.isArray(routeData.host)
        ? routeData.host.join(',')
        : routeData.host || '';
      const hosts = Array.isArray((routeData as unknown as Record<string, string[]>).hosts)
        ? (routeData as unknown as Record<string, string[]>).hosts.join(',')
        : '';
      const combinedHost = `${host} ${hosts}`.toLowerCase();
      const hostMatch = combinedHost.includes(filters.host.toLowerCase());
      if (!hostMatch) return false;
    }

    // Filter by path/URI
    if (filters.path) {
      const uri = Array.isArray(routeData.uri)
        ? routeData.uri.join(',')
        : routeData.uri || '';
      const uris = Array.isArray(routeData.uris)
        ? routeData.uris.join(',')
        : '';
      const combinedPath = `${uri} ${uris}`.toLowerCase();
      const pathMatch = combinedPath.includes(filters.path.toLowerCase());
      if (!pathMatch) return false;
    }

    // Filter by description
    // Note: Routes without a description field are excluded when description filter is active
    if (filters.description) {
      const descMatch = (routeData.desc || '')
        .toLowerCase()
        .includes(filters.description.toLowerCase());
      if (!descMatch) return false;
    }

    // Filter by plugin: treat the filter text as a substring across all plugin names
    // Note: Routes without any plugins are excluded when plugin filter is active
    if (filters.plugin) {
      if (!routeData.plugins) return false;
      const pluginNames = Object.keys(routeData.plugins).join(',').toLowerCase();
      const pluginMatch = pluginNames.includes(filters.plugin.toLowerCase());
      if (!pluginMatch) return false;
    }

    // Filter by labels: match provided label key:value tokens against route label pairs
    // Note: Routes without any labels are excluded when labels filter is active
    if (filters.labels && filters.labels.length > 0) {
      if (!routeData.labels) return false;

      const routeLabels = Object.keys(routeData.labels).map((key) =>
        `${key}:${routeData.labels![key]}`.toLowerCase()
      );
      const hasMatchingLabel = filters.labels.some((filterLabel) =>
        routeLabels.some((routeLabel) =>
          routeLabel.includes(filterLabel.toLowerCase())
        )
      );
      if (!hasMatchingLabel) return false;
    }

    // Filter by version
    if (filters.version) {
      if (!routeData.labels?.version) return false;
      const versionMatch = routeData.labels.version === filters.version;
      if (!versionMatch) return false;
    }

    // Filter by status
    if (filters.status && filters.status !== STATUS_ALL) {
      const isPublished = routeData.status === 1;
      if (filters.status === 'Published' && !isPublished) return false;
      if (filters.status === 'UnPublished' && isPublished) return false;
    }

    return true;
  });
};

/**
 * Check if client-side filtering is needed
 * Returns true if any filter parameters are present
 */
export const needsClientSideFiltering = (
  filters: SearchFormValues
): boolean => {
  return Boolean(
    filters.id ||
    filters.host ||
    filters.path ||
    filters.description ||
    filters.plugin ||
    (filters.labels && filters.labels.length > 0) ||
    filters.version ||
    (filters.status && filters.status !== STATUS_ALL)
  );
};

/**
 * Paginate filtered results
 */
export const paginateResults = <T>(
  items: T[],
  page: number,
  pageSize: number
): { list: T[]; total: number } => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    list: items.slice(startIndex, endIndex),
    total: items.length,
  };
};
