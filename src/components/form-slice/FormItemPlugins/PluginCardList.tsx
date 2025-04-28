import {
  Combobox,
  ScrollArea,
  SimpleGrid,
  TextInput,
  useVirtualizedCombobox,
  type TextInputProps,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { PluginCard, type PluginCardProps } from './PluginCard';
import { useTranslation } from 'react-i18next';

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
    />
  );
};
export type PluginCardListProps = Pick<PluginCardProps, 'mode'> &
  Partial<Pick<PluginCardProps, 'onAdd' | 'onEdit' | 'onDelete'>> &
  Pick<TextInputProps, 'placeholder'> & {
    cols?: number;
    h?: number | string;
    mah?: number | string;
    search: string;
    plugins: string[];
  };

export const PluginCardList = (props: PluginCardListProps) => {
  const {
    mode,
    onAdd,
    onEdit,
    onDelete,
    search = '',
    cols = 3,
    h,
    mah,
    plugins,
  } = props;
  const { t } = useTranslation();
  const combobox = useVirtualizedCombobox();
  const items = useMemo(() => {
    const s = search.toLowerCase().trim();
    const d = s ? plugins.filter((d) => d.toLowerCase().includes(s)) : plugins;
    return d.map((name) => (
      <Combobox.Option key={name} value={name} p={0}>
        <PluginCard
          mode={mode}
          name={name}
          onAdd={() => {
            onAdd?.(name);
          }}
          onEdit={() => {
            onEdit?.(name);
          }}
          onDelete={() => {
            onDelete?.(name);
          }}
        />
      </Combobox.Option>
    ));
  }, [search, plugins, mode, onAdd, onEdit, onDelete]);

  useEffect(() => {
    combobox.updateSelectedOptionIndex();
  }, [combobox, search]);

  return (
    <Combobox store={combobox}>
      <Combobox.Options mt="1em">
        <ScrollArea.Autosize h={h} mah={mah}>
          {items.length > 0 ? (
            <SimpleGrid cols={cols}>{items}</SimpleGrid>
          ) : (
            <Combobox.Empty>{t('noData')}</Combobox.Empty>
          )}
        </ScrollArea.Autosize>
      </Combobox.Options>
    </Combobox>
  );
};
