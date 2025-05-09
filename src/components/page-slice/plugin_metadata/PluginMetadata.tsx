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
import { Drawer, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { difference } from 'rambdax';
import { useTranslation } from 'react-i18next';
import { useDeepCompareEffect } from 'react-use';

import { deletePluginMetadataReq, putPluginMetadataReq } from '@/apis/plugins';
import type { PluginCardProps } from '@/components/form-slice/FormItemPlugins/PluginCard';
import {
  PluginCardList,
  PluginCardListSearch,
} from '@/components/form-slice/FormItemPlugins/PluginCardList';
import {
  type PluginConfig,
  PluginEditorDrawer,
} from '@/components/form-slice/FormItemPlugins/PluginEditorDrawer';
import { SelectPluginsDrawer } from '@/components/form-slice/FormItemPlugins/SelectPluginsDrawer';

import { type PluginInfo,usePluginMetadataList } from './hooks';

export const PluginMetadata = observer(() => {
  const { t } = useTranslation();

  const getMetadataListReq = usePluginMetadataList();
  const putMetadata = useMutation({
    mutationFn: putPluginMetadataReq,
    onSuccess(_, variables) {
      notifications.show({
        message: t('pluginMetadata.update.success', { name: variables.name }),
        color: 'green',
      });
      getMetadataListReq.refetch();
    },
  });
  const deleteMetadata = useMutation({
    mutationFn: (name: string) => deletePluginMetadataReq(name),
    onSuccess(_, name) {
      notifications.show({
        message: t('pluginMetadata.delete.success', { name }),
        color: 'green',
      });
      getMetadataListReq.refetch();
    },
  });

  const pluginsOb = useLocalObservable(() => ({
    __map: new Map<string, PluginConfig>(),
    __schemaMap: new Map<string, object>(),
    init(map: Map<string, PluginInfo>, hasConfigNames: string[]) {
      // we need to clear the map first
      this.__map.clear();
      this.__schemaMap.clear();
      this.allPluginNames = [];
      for (const [name, info] of map.entries()) {
        if (hasConfigNames.includes(name)) {
          this.__map.set(name, info);
        }
        this.__schemaMap.set(name, info.schema);
        this.allPluginNames.push(name);
      }
    },
    delete(name: string) {
      deleteMetadata.mutateAsync(name);
    },
    update(config: PluginConfig) {
      putMetadata.mutateAsync(config);
    },
    allPluginNames: [] as string[],
    get selected() {
      return Array.from(this.__map.keys());
    },
    get unSelected() {
      return difference(this.allPluginNames, this.selected);
    },
    curPlugin: {} as PluginConfig,
    curPluginSchema: {} as object,
    setCurPlugin(name: string) {
      this.curPlugin = this.__map.get(name) || { name, config: {} };
      this.curPluginSchema = this.__schemaMap.get(name)!;
      this.setEditorOpened(true);
    },
    editorOpened: false,
    setEditorOpened(val: boolean) {
      this.editorOpened = val;
    },
    closeEditor() {
      this.setEditorOpened(false);
      this.setSelectPluginsOpened(false);
      this.curPlugin = {} as PluginConfig;
    },
    search: '',
    setSearch(val: string) {
      this.search = val;
    },
    mode: 'edit' as PluginCardProps['mode'],
    selectPluginsOpened: false,
    setSelectPluginsOpened(val: boolean) {
      this.selectPluginsOpened = val;
    },
    on(mode: PluginCardProps['mode'], name: string) {
      this.setCurPlugin(name);
      this.mode = mode;
    },
  }));

  const { pluginInfoMap, hasConfigNames, isLoading } = getMetadataListReq;
  // init the selected plugins
  useDeepCompareEffect(() => {
    if (isLoading) return;
    pluginsOb.init(pluginInfoMap, hasConfigNames);
  }, [pluginInfoMap, hasConfigNames, pluginsOb, isLoading]);

  return (
    <Drawer.Stack>
      <Group>
        <PluginCardListSearch
          search={pluginsOb.search}
          setSearch={pluginsOb.setSearch}
        />
        <SelectPluginsDrawer
          plugins={pluginsOb.unSelected}
          onAdd={(name) => pluginsOb.on('add', name)}
          opened={pluginsOb.selectPluginsOpened}
          setOpened={pluginsOb.setSelectPluginsOpened}
        />
      </Group>
      <PluginCardList
        mode="edit"
        placeholder={t('pluginMetadata.search')}
        mah="60vh"
        search={pluginsOb.search}
        plugins={pluginsOb.selected}
        onDelete={pluginsOb.delete}
        onEdit={(name) => pluginsOb.on('edit', name)}
      />
      <PluginEditorDrawer
        mode={pluginsOb.mode}
        schema={toJS(pluginsOb.curPluginSchema)}
        opened={pluginsOb.editorOpened}
        onClose={pluginsOb.closeEditor}
        plugin={pluginsOb.curPlugin}
        onSave={pluginsOb.update}
      />
    </Drawer.Stack>
  );
});
