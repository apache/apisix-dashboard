import { useListState, useMap } from '@mantine/hooks';
import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
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
            // skip show 500 error toast
            [SKIP_INTERCEPTOR_HEADER]: ['500'],
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
