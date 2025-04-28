import {
  getPluginMetadataQueryOptions,
  getPluginsListWithSchemaQueryOptions,
} from '@/apis/plugins';
import type { PluginConfig } from '@/components/form-slice/FormItemPlugins/PluginEditorDrawer';
import { SKIP_INTERCEPTOR_HEADER } from '@/config/constant';

import { useListState, useMap } from '@mantine/hooks';
import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { useDeepCompareEffect } from 'react-use';

export type PluginInfo = PluginConfig & { schema: object };
export const usePluginMetadataList = () => {
  const pluginsListQuery = useSuspenseQuery(
    getPluginsListWithSchemaQueryOptions({ schema: 'metadata_schema' })
  );

  // 只有当插件列表加载完成后再获取元数据
  const { names, originObj } = pluginsListQuery.data;

  // 为每个插件创建元数据查询
  const metadataQueries = useQueries({
    queries: names.map((pluginName) => ({
      ...getPluginMetadataQueryOptions(pluginName, {
        [SKIP_INTERCEPTOR_HEADER]: ['500'],
      }),
      // 避免当一个插件没有元数据时显示错误
      retry: false,
      // 只有当插件列表已加载时才开始获取
      enabled: !pluginsListQuery.isPending && !pluginsListQuery.isError,
    })),
  });
  const [hasConfigNames, hasConfigNamesOp] = useListState<string>();
  const pluginInfoMap = useMap<string, PluginInfo>();

  useDeepCompareEffect(() => {
    for (const [index, pluginName] of names.entries()) {
      const metadataQuery = metadataQueries[index];
      const info = {
        name: pluginName,
        config: metadataQuery.isSuccess ? metadataQuery.data.value : {},
        schema: originObj[pluginName].metadata_schema as object,
      };
      pluginInfoMap.set(pluginName, info);
      if (metadataQuery.isSuccess) {
        hasConfigNamesOp.append(pluginName);
      }
    }
  }, [metadataQueries, names]);

  return {
    isLoading: pluginsListQuery.isPending,
    isError: pluginsListQuery.isError,
    error: pluginsListQuery.error,
    hasConfigNames,
    pluginInfoMap,
    isMetadataLoading: metadataQueries.some((query) => query.isPending),
    allPluginNames: names,
    originalMetadataQueries: metadataQueries,
    refetch: () => {
      pluginsListQuery.refetch();
      metadataQueries.forEach((query) => query.refetch());
    },
  };
};
