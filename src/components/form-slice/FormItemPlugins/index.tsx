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
import {
  Drawer,
  Group,
  InputWrapper,
  type InputWrapperProps,
} from '@mantine/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { difference } from 'rambdax';
import { useCallback, useMemo, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  getPluginsListWithSchemaQueryOptions,
  type NeedPluginSchema,
} from '@/apis/plugins';
import { genControllerProps } from '@/components/form/util';
import type { APISIXType } from '@/types/schema/apisix';

import type { PluginCardProps } from './PluginCard';
import { PluginCardList, PluginCardListSearch } from './PluginCardList';
import { type PluginConfig, PluginEditorDrawer } from './PluginEditorDrawer';
import { SelectPluginsDrawer } from './SelectPluginsDrawer';

export type FormItemPluginsProps<T extends FieldValues> = InputWrapperProps &
  UseControllerProps<T> & {
    onChange?: (value: Record<string, unknown>) => void;
  } & Partial<NeedPluginSchema>;

/**
 * Plugins editor for Route / Service / Upstream forms.
 *
 * Architecture: react-hook-form's controller value (`rawObject`) is the
 * single source of truth. There is no local Map cache that mirrors it —
 * the previous `useLocalObservable + __map + useEffect([..., rawObject])
 * + save → fOnChange` triangle created the same bidirectional-sync race
 * as #3293, where an in-flight `rawObject` update from elsewhere could
 * reinitialize `__map` from a stale snapshot and overwrite a just-saved
 * plugin config on Submit. Reading directly from `rawObject` removes the
 * race entirely.
 *
 * Only transient UI state (current open plugin name, drawer open flags,
 * search query, edit/view mode) lives in component state.
 */
export const FormItemPlugins = <T extends FieldValues>(
  props: FormItemPluginsProps<T>
) => {
  const {
    controllerProps,
    restProps: { schema = 'schema', ...restProps },
  } = genControllerProps(props, {});
  const { t } = useTranslation();

  const {
    field: { value: rawValue, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const isView = useMemo(() => restField.disabled, [restField.disabled]);

  // rawValue may be `undefined` when the form is first mounted with no
  // plugins yet — normalize to an empty object for read paths. Wrapped in
  // useMemo so identity is stable across renders that don't change the
  // form value (otherwise downstream useCallback / useMemo deps would
  // churn every render).
  const rawObject = useMemo(
    () => (rawValue ?? {}) as Record<string, object>,
    [rawValue]
  );

  // Selected plugins are derived directly from the form value — no mirror.
  const selected = useMemo(() => Object.keys(rawObject), [rawObject]);

  const pluginsListReq = useSuspenseQuery(
    getPluginsListWithSchemaQueryOptions({ schema })
  );
  const allPluginNames = pluginsListReq.data.names;
  const pluginSchemaObj = pluginsListReq.data.originObj as Record<
    string,
    APISIXType['PluginSchema']
  >;
  const unSelected = useMemo(
    () => difference(allPluginNames, selected),
    [allPluginNames, selected]
  );

  // Pure-UI state. None of these mirror form data.
  const [curPluginName, setCurPluginName] = useState<string | null>(null);
  const [mode, setMode] = useState<PluginCardProps['mode']>('edit');
  const [editorOpened, setEditorOpened] = useState(false);
  const [selectPluginsOpened, setSelectPluginsOpened] = useState(false);
  const [search, setSearch] = useState('');

  const curPlugin = useMemo<PluginConfig>(() => {
    if (!curPluginName) return {} as PluginConfig;
    return {
      name: curPluginName,
      config: rawObject[curPluginName],
    } as PluginConfig;
  }, [curPluginName, rawObject]);

  const curPluginSchema = useMemo(() => {
    if (!curPluginName) return {};
    const d = pluginSchemaObj[curPluginName];
    if (!d) return {};
    return d[schema];
  }, [curPluginName, pluginSchemaObj, schema]);

  const closeEditor = useCallback(() => {
    setEditorOpened(false);
    setCurPluginName(null);
  }, []);

  const handleUpdate = useCallback(
    (config: PluginConfig) => {
      const { name, config: pluginConfig } = config;
      // Build the new plugins object inline — no intermediate cache to go
      // stale. Submit always sees this exact value.
      fOnChange({ ...rawObject, [name]: pluginConfig });
      setSelectPluginsOpened(false);
      closeEditor();
    },
    [closeEditor, fOnChange, rawObject]
  );

  const handleDelete = useCallback(
    (name: string) => {
      const next = { ...rawObject };
      delete next[name];
      fOnChange(next);
    },
    [fOnChange, rawObject]
  );

  const handleOpen = useCallback(
    (m: PluginCardProps['mode'], name: string) => {
      setCurPluginName(name);
      setMode(m);
      setEditorOpened(true);
    },
    []
  );

  return (
    <InputWrapper error={fieldState.error?.message} {...restProps}>
      <input name={fName} type="hidden" />
      <Drawer.Stack>
        <Group>
          <PluginCardListSearch search={search} setSearch={setSearch} />
          <SelectPluginsDrawer
            plugins={unSelected}
            opened={selectPluginsOpened}
            setOpened={setSelectPluginsOpened}
            onAdd={(name) => handleOpen('add', name)}
            disabled={restField.disabled}
          />
        </Group>
        <PluginCardList
          mode={isView ? 'view' : 'edit'}
          placeholder={t('form.plugins.searchForSelectedPlugins')}
          mah="60vh"
          search={search}
          plugins={selected}
          onDelete={handleDelete}
          onView={(name) => handleOpen('view', name)}
          onEdit={(name) => handleOpen('edit', name)}
        />
        <PluginEditorDrawer
          mode={isView ? 'view' : mode}
          schema={curPluginSchema}
          opened={editorOpened}
          onClose={closeEditor}
          plugin={curPlugin}
          onSave={handleUpdate}
        />
      </Drawer.Stack>
    </InputWrapper>
  );
};
