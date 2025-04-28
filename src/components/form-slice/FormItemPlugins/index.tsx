import { genControllerProps } from '@/components/form/util';
import { Group, InputWrapper, type InputWrapperProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getPluginsListQueryOptions } from './req';
import { PluginCardList, PluginCardListSearch } from './PluginCardList';
import { SelectPluginsDrawer } from './SelectPluginsDrawer';
import { useMount } from 'react-use';
import { difference } from 'rambdax';
import type { PluginConfig } from './UpdatePluginDrawer';
import { observer, useLocalObservable } from 'mobx-react-lite';

type FormItemPluginsProps<T extends FieldValues> = InputWrapperProps &
  UseControllerProps<T> & {
    onChange?: (value: Record<string, unknown>) => void;
  };

const FormItemPluginsCore = <T extends FieldValues>(
  props: FormItemPluginsProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, {});
  const { t } = useTranslation();

  const {
    field: { value: rawObject, onChange: fOnChange, name: fName },
    fieldState,
  } = useController<T>(controllerProps);

  const pluginsListReq = useSuspenseQuery(getPluginsListQueryOptions());
  const [search, setSearch] = useState('');
  const plugins$ = useLocalObservable(() => ({
    __map: new Map<string, object>(),
    init(obj: Record<string, object>) {
      this.__map = new Map(Object.entries(obj));
    },
    set(name: string, config: object) {
      this.__map.set(name, config);
      this.save();
    },
    delete(name: string) {
      this.__map.delete(name);
      this.save();
    },
    get selected() {
      return Array.from(this.__map.keys());
    },
    get unSelected() {
      return difference(pluginsListReq.data, this.selected);
    },
    save() {
      const obj = Object.fromEntries(this.__map);
      fOnChange(obj);
    },
  }));

  useMount(() => {
    plugins$.init(rawObject);
  });

  const handleSave = (props: PluginConfig) => {
    const { name, config } = props;
    plugins$.set(name, config);
  };

  return (
    <InputWrapper
      label={t('form.plugins.label')}
      error={fieldState.error?.message}
      {...restProps}
    >
      <input name={fName} type="hidden" />
      <Group>
        <PluginCardListSearch search={search} setSearch={setSearch} />
        <SelectPluginsDrawer
          plugins={plugins$.unSelected}
          onSave={handleSave}
        />
      </Group>
      <PluginCardList
        mode="edit"
        placeholder={t('form.plugins.searchForSelectedPlugins')}
        mah="60vh"
        search={search}
        plugins={plugins$.selected}
        onDelete={plugins$.delete}
      />
    </InputWrapper>
  );
};

export const FormItemPlugins = observer(FormItemPluginsCore);
