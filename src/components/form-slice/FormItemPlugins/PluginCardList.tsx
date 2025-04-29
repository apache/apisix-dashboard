import {
  CloseButton,
  Combobox,
  ScrollArea,
  SimpleGrid,
  TextInput,
  useVirtualizedCombobox,
  type TextInputProps,
} from '@mantine/core';
import { PluginCard, type PluginCardProps } from './PluginCard';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useLayoutEffect } from 'react';

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
const Option = observer((props: OptionProps) => {
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
});

const Options = observer((props: { list: OptionProps[] }) => {
  const { list } = props;
  return (
    <>
      {list.map((option) => (
        <Option key={option.name} {...option} />
      ))}
    </>
  );
});

export type PluginCardListProps = Omit<OptionProps, 'name'> &
  Pick<TextInputProps, 'placeholder'> & {
    cols?: number;
    h?: number | string;
    mah?: number | string;
    search: string;
    plugins: string[];
  };

const PluginCardListCore = (props: PluginCardListProps) => {
  const { search = '', cols = 3, h, mah, plugins } = props;
  const { mode, onAdd, onEdit, onDelete, onView } = props;
  const { t } = useTranslation();
  const combobox = useVirtualizedCombobox();
  const optionsOb = useLocalObservable(() => ({
    search: search,
    plugins: plugins,
    mode: mode,
    viewPlugin: '',
    viewOpened: false,
    setViewOpened(opened: boolean) {
      this.viewOpened = opened;
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

  // handle state and useLocalObservable
  useLayoutEffect(() => {
    optionsOb.search = search.toLowerCase().trim();
    optionsOb.plugins = plugins;
    optionsOb.mode = mode;
  }, [optionsOb, search, plugins, mode]);

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

export const PluginCardList = observer(PluginCardListCore);
