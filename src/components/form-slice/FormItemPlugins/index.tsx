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
import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { difference } from 'rambdax';
import { useEffect, useMemo } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDeepCompareEffect } from 'react-use';

import {
  getPluginsListWithSchemaQueryOptions,
  type NeedPluginSchema,
} from '@/apis/plugins';
import { genControllerProps } from '@/components/form/util';
import type { APISIXType } from '@/types/schema/apisix';

import type { PluginCardProps } from './PluginCard';
import { PluginCardList, PluginCardListSearch } from './PluginCardList';
import { type PluginConfig,PluginEditorDrawer } from './PluginEditorDrawer';
import { SelectPluginsDrawer } from './SelectPluginsDrawer';

export type FormItemPluginsProps<T extends FieldValues> = InputWrapperProps &
  UseControllerProps<T> & {
    onChange?: (value: Record<string, unknown>) => void;
  } & Partial<NeedPluginSchema>;

const FormItemPluginsCore = <T extends FieldValues>(
  props: FormItemPluginsProps<T>
) => {
  const {
    controllerProps,
    restProps: { schema = 'schema', ...restProps },
  } = genControllerProps(props, {});
  const { t } = useTranslation();

  const {
    field: { value: rawObject, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const isView = useMemo(() => restField.disabled, [restField.disabled]);

  const pluginsOb = useLocalObservable(() => ({
    __map: new Map<string, object>(),
    init(obj: Record<string, object>) {
      this.__map = new Map(Object.entries(obj));
    },
    delete(name: string) {
      this.__map.delete(name);
      this.save();
    },
    allPluginNames: [] as string[],
    pluginSchemaObj: new Map<string, APISIXType['PluginSchema']>(),
    initPlugins(props: {
      names: string[];
      originObj: Record<string, Record<string, unknown>>;
    }) {
      const { names, originObj } = props;
      this.allPluginNames = names;
      this.pluginSchemaObj = new Map(Object.entries(originObj));
    },
    get selected() {
      return Array.from(this.__map.keys());
    },
    get unSelected() {
      return difference(this.allPluginNames, this.selected);
    },
    save() {
      const obj = Object.fromEntries(this.__map);
      fOnChange(obj);
    },
    update(config: PluginConfig) {
      const { name, config: pluginConfig } = config;
      this.__map.set(name, pluginConfig);
      this.save();
    },
    curPlugin: {} as PluginConfig,
    setCurPlugin(name: string) {
      this.curPlugin = {
        name,
        config: this.__map.get(name),
      } as PluginConfig;
      this.setEditorOpened(true);
    },
    get curPluginSchema() {
      const d = this.pluginSchemaObj.get(this.curPlugin.name);
      if (!d) return {};
      return d[schema];
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

  const pluginsListReq = useSuspenseQuery(
    getPluginsListWithSchemaQueryOptions({ schema })
  );

  // init the selected plugins
  useEffect(() => {
    pluginsOb.init(rawObject);
  }, [pluginsOb, rawObject]);
  useDeepCompareEffect(() => {
    pluginsOb.initPlugins(pluginsListReq.data);
  }, [pluginsOb, pluginsListReq.data]);

  return (
    <InputWrapper error={fieldState.error?.message} {...restProps}>
      <input name={fName} type="hidden" />
      <Drawer.Stack>
        <Group>
          <PluginCardListSearch
            search={pluginsOb.search}
            setSearch={pluginsOb.setSearch}
          />
          <SelectPluginsDrawer
            plugins={pluginsOb.unSelected}
            opened={pluginsOb.selectPluginsOpened}
            setOpened={pluginsOb.setSelectPluginsOpened}
            onAdd={(name) => pluginsOb.on('add', name)}
            disabled={restField.disabled}
          />
        </Group>
        <PluginCardList
          mode={isView ? 'view' : 'edit'}
          placeholder={t('form.plugins.searchForSelectedPlugins')}
          mah="60vh"
          search={pluginsOb.search}
          plugins={pluginsOb.selected}
          onDelete={pluginsOb.delete}
          onView={(name) => pluginsOb.on('view', name)}
          onEdit={(name) => pluginsOb.on('edit', name)}
        />
        <PluginEditorDrawer
          mode={isView ? 'view' : 'edit'}
          schema={toJS(pluginsOb.curPluginSchema)}
          opened={pluginsOb.editorOpened}
          onClose={pluginsOb.closeEditor}
          plugin={pluginsOb.curPlugin}
          onSave={pluginsOb.update}
        />
      </Drawer.Stack>
    </InputWrapper>
  );
};

export const FormItemPlugins = observer(FormItemPluginsCore);
