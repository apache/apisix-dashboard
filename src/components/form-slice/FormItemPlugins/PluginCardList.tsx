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
  ScrollArea,
  SimpleGrid,
  Text,
  TextInput,
  type TextInputProps,
} from '@mantine/core';
import { useMemo } from 'react';
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
          aria-label={t('a11y.clearSearch')}
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

type PluginListItemProps = Pick<
  PluginCardProps,
  'onAdd' | 'onEdit' | 'onDelete' | 'onView' | 'mode'
> & {
  name: string;
};
const PluginListItem = (props: PluginListItemProps) => {
  const { mode, name, onAdd, onEdit, onDelete, onView } = props;
  return (
    <li>
      <PluginCard
        mode={mode}
        name={name}
        onAdd={() => onAdd?.(name)}
        onEdit={() => onEdit?.(name)}
        onDelete={() => onDelete?.(name)}
        onView={() => onView?.(name)}
      />
    </li>
  );
};

const PluginListItems = (props: { list: PluginListItemProps[] }) => {
  const { list } = props;
  return (
    <>
      {list.map((option) => (
        <PluginListItem key={option.name} {...option} />
      ))}
    </>
  );
};

export type PluginCardListProps = Omit<PluginListItemProps, 'name'> &
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

  const list = useMemo(() => {
    const query = search.toLowerCase().trim();
    const matched = !query
      ? plugins
      : plugins.filter((d) => d.toLowerCase().includes(query));
    return matched.map((name) => ({
      name,
      mode,
      onAdd,
      onEdit,
      onDelete,
      onView,
    }));
  }, [search, plugins, mode, onAdd, onEdit, onDelete, onView]);

  return (
    <ScrollArea.Autosize mt="1em" h={h} mah={mah} type="scroll">
      {!list.length ? (
        <Text c="dimmed" ta="center" py="sm">
          {t('noData')}
        </Text>
      ) : (
        <SimpleGrid
          component="ul"
          cols={cols}
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          <PluginListItems list={list} />
        </SimpleGrid>
      )}
    </ScrollArea.Autosize>
  );
};
