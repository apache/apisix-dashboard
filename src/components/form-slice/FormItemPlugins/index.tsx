import { genControllerProps } from '@/components/form/util';
import {
  Drawer,
  Group,
  InputWrapper,
  type InputWrapperProps,
} from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import { PluginCardList, PluginCardListSearch } from './PluginCardList';
import { SelectPluginsDrawer } from './SelectPluginsDrawer';
import { difference } from 'rambdax';
import { PluginEditorDrawer, type PluginConfig } from './PluginEditorDrawer';
import { observer, useLocalObservable } from 'mobx-react-lite';
import type { PluginCardProps } from './PluginCard';
import {
  getPluginsListWithSchemaQueryOptions,
  type NeedPluginSchema,
} from '@/apis/plugins';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDeepCompareEffect } from 'react-use';
import type { APISIXType } from '@/types/schema/apisix';
import { toJS } from 'mobx';

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

