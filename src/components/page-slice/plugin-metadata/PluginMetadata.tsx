import { Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { usePluginMetadataList, type PluginInfo } from './hooks';
import {
  PluginCardList,
  PluginCardListSearch,
} from '@/components/form-slice/FormItemPlugins/PluginCardList';
import { SelectPluginsDrawer } from '@/components/form-slice/FormItemPlugins/SelectPluginsDrawer';
import { difference } from 'rambdax';
import {
  PluginEditorDrawer,
  type PluginConfig,
} from '@/components/form-slice/FormItemPlugins/PluginEditorDrawer';
import { observer, useLocalObservable } from 'mobx-react-lite';

export const PluginMetadata = observer(() => {
  const { t } = useTranslation();

  const pluginMetadataListReq = usePluginMetadataList();

  const [search, setSearch] = useState('');
  const pluginsOb = useLocalObservable(() => ({
    __map: new Map<string, PluginConfig>(),
    __schemaMap: new Map<string, object>(),
    init(map: Map<string, PluginInfo>, hasConfigNames: string[]) {
      for (const name of hasConfigNames) {
        this.__map.set(name, map.get(name)!);
      }
      for (const [name, info] of map.entries()) {
        this.__schemaMap.set(name, info.schema);
      }
    },
    delete(name: string) {
      this.__map.delete(name);
      this.save();
    },
    allPluginNames: [] as string[],
    setAllPluginNames(names: string[]) {
      this.allPluginNames = names;
    },
    get selected() {
      return Array.from(this.__map.keys());
    },
    get unSelected() {
      return difference(this.allPluginNames, this.selected);
    },
    save() {
      // const obj = Object.fromEntries(this.__map);
      // fOnChange(obj);
    },
    update(config: PluginConfig) {
      this.__map.set(config.name, config);
      this.save();
    },
    curPlugin: {} as PluginConfig,
    setCurPlugin(name: string) {
      this.curPlugin = this.__map.get(name)!;
      this.setEditorOpened(true);
    },
    get curPluginSchema() {
      return this.__schemaMap.get(this.curPlugin.name)!;
    },
    editorOpened: false,
    setEditorOpened(val: boolean) {
      this.editorOpened = val;
    },
    closeEditor() {
      this.editorOpened = false;
      this.curPlugin = {} as PluginConfig;
    },
  }));
  // console.log(
  //   toJS(pluginsOb.curPluginSchema),
  //   toJS(pluginsOb.__schemaMap),
  //   'daasas'
  // );

  // init the selected plugins
  useEffect(() => {
    pluginsOb.init(
      pluginMetadataListReq.pluginInfoMap,
      pluginMetadataListReq.hasConfigNames
    );
  }, [
    pluginMetadataListReq.pluginInfoMap,
    pluginMetadataListReq.hasConfigNames,
    pluginsOb,
  ]);

  useEffect(() => {
    pluginsOb.setAllPluginNames(pluginMetadataListReq.allPluginNames);
  }, [pluginMetadataListReq.allPluginNames, pluginsOb]);

  return (
    <>
      <Group>
        <PluginCardListSearch search={search} setSearch={setSearch} />
        <SelectPluginsDrawer
          schema={pluginsOb.curPluginSchema}
          plugins={pluginsOb.unSelected}
          onSave={pluginsOb.update}
        />
      </Group>
      <PluginCardList
        mode="edit"
        placeholder={t('pluginMetadata.search')}
        mah="60vh"
        search={search}
        plugins={pluginsOb.selected}
        onDelete={pluginsOb.delete}
        onView={pluginsOb.setCurPlugin}
        onEdit={pluginsOb.setCurPlugin}
      />
      <PluginEditorDrawer
        mode="edit"
        schema={pluginsOb.curPluginSchema}
        opened={pluginsOb.editorOpened}
        onClose={pluginsOb.closeEditor}
        plugin={pluginsOb.curPlugin}
        onSave={pluginsOb.update}
      />
    </>
  );
});
