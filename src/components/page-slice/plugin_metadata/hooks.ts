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
import { useListState, useMap } from '@mantine/hooks';
import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { HttpStatusCode, isAxiosError } from 'axios';
import { useDeepCompareEffect } from 'react-use';

import {
  getPluginMetadataQueryOptions,
  getPluginsListWithSchemaQueryOptions,
} from '@/apis/plugins';
import type { PluginConfig } from '@/components/form-slice/FormItemPlugins/PluginEditorDrawer';
import { SKIP_INTERCEPTOR_HEADER } from '@/config/constant';

export type PluginInfo = PluginConfig & { schema: object };

// waiting apisix api to help handle the request
export const usePluginMetadataList = () => {
  const pluginsListQuery = useSuspenseQuery(
    getPluginsListWithSchemaQueryOptions({ schema: 'metadata_schema' })
  );

  const { names, originObj } = pluginsListQuery.data;

  const metadataQueries = useQueries({
    queries: names
      ? names.map((pluginName) => ({
          ...getPluginMetadataQueryOptions(pluginName, {
            // the Admin API answers 404 for a plugin whose metadata was
            // never configured — that is the normal state for most
            // plugins, not an error, so keep the interceptor quiet.
            // Real failures (5xx, network) still toast.
            [SKIP_INTERCEPTOR_HEADER]: ['404'],
          }),
          retry: false,
        }))
      : [],
  });
  const [hasConfigNames, hasConfigNamesOp] = useListState<string>();
  const pluginInfoMap = useMap<string, PluginInfo>();
  const isLoading =
    pluginsListQuery.isPending ||
    metadataQueries.some((query) => query.isPending);

  useDeepCompareEffect(() => {
    if (isLoading) return;
    // clear the list first
    hasConfigNamesOp.setState([]);
    for (const [index, pluginName] of names.entries()) {
      const req = metadataQueries[index];
      // 404 means "not configured yet" — offer an empty config.
      // Any other failure (5xx, network) must NOT be presented as an
      // empty config: saving that would overwrite existing metadata.
      const isUnconfigured =
        req.isError &&
        isAxiosError(req.error) &&
        req.error.response?.status === HttpStatusCode.NotFound;
      if (!req.isSuccess && !isUnconfigured) continue;
      const info = {
        name: pluginName,
        config: req.isSuccess ? req.data?.value : {},
        schema: originObj[pluginName].metadata_schema as object,
      };
      pluginInfoMap.set(pluginName, info);
      if (req.isSuccess) {
        hasConfigNamesOp.append(pluginName);
      }
    }
  }, [metadataQueries, names]);

  return {
    isLoading,
    isError: pluginsListQuery.isError,
    error: pluginsListQuery.error,
    hasConfigNames,
    pluginInfoMap,
    allPluginNames: names,
    originalMetadataQueries: metadataQueries,
    refetch: () => {
      pluginsListQuery.refetch();
      metadataQueries.forEach((query) => query.refetch());
    },
  };
};
