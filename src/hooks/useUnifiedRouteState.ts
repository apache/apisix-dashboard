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

import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteQueryOptions } from '@/apis/hooks';
import { putRouteReq } from '@/apis/routes';
import type { RoutePutType } from '@/components/form-slice/FormPartRoute/schema';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import {
  apiToInternal,
  formToInternal,
  internalToApi,
  internalToForm,
  internalToJson,
  jsonToInternal,
  type RouteInternal,
} from '@/utils/route-transformer';

import {
  type UnifiedResourceState,
  useUnifiedResourceState,
} from './useUnifiedResourceState';

export type UnifiedRouteState = UnifiedResourceState<
  RoutePutType,
  APISIXType['Route']
>;

/**
 * Route-specific unified state hook
 *
 * Wraps useUnifiedResourceState with Route-specific configuration:
 * - React Query for route data
 * - Route transformers for API/Form/JSON conversions
 * - Success/error notifications
 *
 * @param id - Route ID to fetch and edit
 * @returns UnifiedRouteState for managing route editing
 *
 * @example
 * ```tsx
 * const unifiedState = useUnifiedRouteState(routeId);
 *
 * // Use in component
 * <Tabs value={unifiedState.activeView}>
 *   <Tabs.Panel value="form">
 *     <RouteForm formDraft={unifiedState.formDraft} ... />
 *   </Tabs.Panel>
 *   <Tabs.Panel value="json">
 *     <JSONEditor value={unifiedState.jsonDraft} ... />
 *   </Tabs.Panel>
 * </Tabs>
 * ```
 */
export function useUnifiedRouteState(id: string): UnifiedRouteState {
  const { t } = useTranslation();

  // Query for route data
  const routeQuery = useQuery(getRouteQueryOptions(id));

  // Mutation for saving route
  const putRouteMutation = useMutation({
    mutationFn: (data: APISIXType['Route']) => putRouteReq(req, data),
    onSuccess: () => {
      notifications.show({
        message: t('info.edit.success', { name: t('routes.singular') }),
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message || t('form.view.transformError'),
        color: 'red',
      });
    },
  });

  // Transform configuration
  const transforms = useMemo(
    () => ({
      apiToInternal: apiToInternal as (
        api: APISIXType['Route']
      ) => RouteInternal,
      internalToApi: internalToApi as (
        internal: RouteInternal
      ) => APISIXType['Route'],
      internalToForm: internalToForm as (internal: RouteInternal) => RoutePutType,
      formToInternal: formToInternal as (form: RoutePutType) => RouteInternal,
      internalToJson,
      jsonToInternal,
    }),
    []
  );

  return useUnifiedResourceState<RouteInternal, RoutePutType, APISIXType['Route']>(
    {
      query: routeQuery,
      mutation: putRouteMutation,
      transforms,
    }
  );
}
