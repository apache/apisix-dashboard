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
  CloseButton,
  Combobox,
  ScrollArea,
  SimpleGrid,
  TextInput,
  type TextInputProps,
  useVirtualizedCombobox,
} from '@mantine/core';
import { useLocalObservable } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginCard, type PluginCardProps } from './PluginCard';

type PluginCardListSearchProps = Pick<TextInputProps, 'placeholder'> & {
  search: string;
  setSearch: (search: string) => void;
};
export const PluginCardListSearch = (props: PluginCardListSearchProps) => {
  const { placeholder, search, setSearch } = props;
  const { t } = useTranslation();
  return (
    <TextInput
      placeholder={placeholder || t('form.search')}
      value={search}
      style={{ flexGrow: 1, position: 'sticky', top: 0 }}
      onChange={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setSearch(event.currentTarget.value);
      }}
      rightSectionPointerEvents="all"
      rightSection={
        <CloseButton
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setSearch('');
          }}
        />
      }
    />
  );
};

type OptionProps = Pick<
  PluginCardProps,
  'onAdd' | 'onEdit' | 'onDelete' | 'onView' | 'mode'
> & {
  name: string;
};
const Option = (props: OptionProps) => {
  const { mode, name, onAdd, onEdit, onDelete, onView } = props;
  return (
    <Combobox.Option key={name} value={name} p={0}>
      <PluginCard
        mode={mode}
        name={name}
        onAdd={() => onAdd?.(name)}
        onEdit={() => onEdit?.(name)}
        onDelete={() => onDelete?.(name)}
        onView={() => onView?.(name)}
      />
    </Combobox.Option>
  );
};

const Options = (props: { list: OptionProps[] }) => {
  const { list } = props;
  return (
    <>
      {list.map((option) => (
        <Option key={option.name} {...option} />
      ))}
    </>
  );
};

export type PluginCardListProps = Omit<OptionProps, 'name'> &
  Pick<TextInputProps, 'placeholder'> & {
    cols?: number;
    h?: number | string;
    mah?: number | string;
    search: string;
    plugins: string[];
  };

export const PluginCardList = (props: PluginCardListProps) => {
  const { search = '', cols = 3, h, mah, plugins } = props;
  const { mode, onAdd, onEdit, onDelete, onView } = props;
  const { t } = useTranslation();
  const combobox = useVirtualizedCombobox();
  const optionsOb = useLocalObservable(() => ({
    search: '',
    plugins: [] as string[],
    mode: 'add' as OptionProps['mode'],
    setSearch(search: string) {
      this.search = search.toLowerCase().trim();
    },
    setPlugins(plugins: string[]) {
      this.plugins = plugins;
    },
    setMode(mode: PluginCardProps['mode']) {
      this.mode = mode;
    },
    get list() {
      const arr = !this.search
        ? this.plugins
        : this.plugins.filter((d) => d.toLowerCase().includes(this.search));
      return arr.map((name) => ({
        name,
        mode: this.mode,
        onAdd,
        onEdit,
        onDelete,
        onView,
      }));
    },
  }));

  useEffect(() => optionsOb.setPlugins(plugins), [optionsOb, plugins]);
  useEffect(() => optionsOb.setSearch(search), [optionsOb, search]);
  useEffect(() => optionsOb.setMode(mode), [optionsOb, mode]);

  return (
    <Combobox store={combobox}>
      <Combobox.Options mt="1em">
        <ScrollArea.Autosize h={h} mah={mah} type="scroll">
          {!optionsOb.list.length ? (
            <Combobox.Empty>{t('noData')}</Combobox.Empty>
          ) : (
            <SimpleGrid cols={cols}>
              <Options list={optionsOb.list} />
            </SimpleGrid>
          )}
        </ScrollArea.Autosize>
      </Combobox.Options>
    </Combobox>
  );
};
