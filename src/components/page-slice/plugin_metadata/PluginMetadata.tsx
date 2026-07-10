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
import { difference } from 'rambdax';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

import { usePluginMetadataList } from './hooks';

/**
 * Plugin Metadata page.
 *
 * Architecture: read directly from the `usePluginMetadataList()` query
 * result (`pluginInfoMap` + `hasConfigNames`). The previous design used a
 * MobX `__map` / `__schemaMap` mirror that was reinitialized via
 * `useDeepCompareEffect` on every refetch — a parallel refetch could
 * clobber an in-flight edit (same anti-pattern as #3293). Reading the
 * query state directly eliminates the mirror and the race.
 *
 * Only transient UI state lives in component state.
 */
export const PluginMetadata = () => {
  const { t } = useTranslation();

  const metadataList = usePluginMetadataList();
  const { pluginInfoMap, hasConfigNames, failedPluginNames, allPluginNames } =
    metadataList;

  const putMetadata = useMutation({
    mutationFn: putPluginMetadataReq,
    onSuccess(_, variables) {
      notifications.show({
        message: t('info.edit.success', {
          name: `${t('pluginMetadata.singular')} of ${variables.name}`,
        }),
        color: 'green',
      });
      metadataList.refetch();
    },
  });
  const deleteMetadata = useMutation({
    mutationFn: (name: string) => deletePluginMetadataReq(name),
    onSuccess(_, name) {
      notifications.show({
        message: t('info.delete.success', {
          name: `${t('pluginMetadata.singular')} of ${name}`,
        }),
        color: 'green',
      });
      metadataList.refetch();
    },
  });

  // Pure-UI state. None of these mirror query data.
  const [curPluginName, setCurPluginName] = useState<string | null>(null);
  const [mode, setMode] = useState<PluginCardProps['mode']>('edit');
  const [editorOpened, setEditorOpened] = useState(false);
  const [selectPluginsOpened, setSelectPluginsOpened] = useState(false);
  const [search, setSearch] = useState('');

  const unSelected = useMemo(
    // a plugin whose metadata fetch failed (non-404) must not be offered
    // as an empty config: saving it would overwrite existing metadata
    () =>
      difference(allPluginNames ?? [], [
        ...hasConfigNames,
        ...failedPluginNames,
      ]),
    [allPluginNames, hasConfigNames, failedPluginNames]
  );

  const curPlugin = useMemo<PluginConfig>(() => {
    if (!curPluginName) return {} as PluginConfig;
    const info = pluginInfoMap.get(curPluginName);
    if (info) {
      return { name: info.name, config: info.config } as PluginConfig;
    }
    // fall back to an empty config only for plugins legitimately offered
    // as unconfigured — never for ones whose fetch failed
    return unSelected.includes(curPluginName)
      ? ({ name: curPluginName, config: {} } as PluginConfig)
      : ({} as PluginConfig);
  }, [curPluginName, pluginInfoMap, unSelected]);

  const curPluginSchema = useMemo(() => {
    if (!curPluginName) return {};
    return pluginInfoMap.get(curPluginName)?.schema ?? {};
  }, [curPluginName, pluginInfoMap]);

  const closeEditor = useCallback(() => {
    setEditorOpened(false);
    setSelectPluginsOpened(false);
    setCurPluginName(null);
  }, []);

  const handleOpen = useCallback(
    (m: PluginCardProps['mode'], name: string) => {
      setCurPluginName(name);
      setMode(m);
      setEditorOpened(true);
    },
    []
  );

  const handleUpdate = useCallback(
    (config: PluginConfig) => putMetadata.mutateAsync(config),
    [putMetadata]
  );

  const handleDelete = useCallback(
    (name: string) => deleteMetadata.mutateAsync(name),
    [deleteMetadata]
  );

  return (
    <Drawer.Stack>
      <Group>
        <PluginCardListSearch search={search} setSearch={setSearch} />
        <SelectPluginsDrawer
          plugins={unSelected}
          onAdd={(name) => handleOpen('add', name)}
          opened={selectPluginsOpened}
          setOpened={setSelectPluginsOpened}
        />
      </Group>
      <PluginCardList
        mode="edit"
        placeholder={t('pluginMetadata.search')}
        mah="60vh"
        search={search}
        plugins={hasConfigNames}
        onDelete={handleDelete}
        onEdit={(name) => handleOpen('edit', name)}
      />
      <PluginEditorDrawer
        mode={mode}
        schema={curPluginSchema}
        opened={editorOpened}
        onClose={closeEditor}
        plugin={curPlugin}
        onSave={handleUpdate}
      />
    </Drawer.Stack>
  );
};
