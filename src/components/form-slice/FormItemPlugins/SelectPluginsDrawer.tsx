import { Button, Drawer } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  PluginCardList,
  PluginCardListSearch,
  type PluginCardListProps,
} from './PluginCardList';
import { useState } from 'react';
import { type PluginEditorDrawerProps } from './PluginEditorDrawer';
import { observer } from 'mobx-react-lite';

export type SelectPluginsDrawerProps = Pick<PluginCardListProps, 'plugins'> &
  Pick<PluginEditorDrawerProps, 'schema'> & {
    onAdd: (name: string) => void;
    opened: boolean;
    setOpened: (open: boolean) => void;
  };
export const SelectPluginsDrawerCore = (props: SelectPluginsDrawerProps) => {
  const { plugins, onAdd, opened, setOpened } = props;
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  return (
    <>
      <Drawer
        offset={0}
        radius="md"
        position="right"
        size="xl"
        closeOnEscape={false}
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('form.plugins.selectPlugins.title')}
      >
        <Drawer.Header p={0} mih="60px">
          <PluginCardListSearch search={search} setSearch={setSearch} />
        </Drawer.Header>

        <PluginCardList
          mode="add"
          cols={2}
          h="80vh"
          search={search}
          onAdd={onAdd}
          plugins={plugins}
        />
      </Drawer>
      <Button ml={8} onClick={() => setOpened(true)}>
        {t('form.plugins.selectPlugins.title')}
      </Button>
    </>
  );
};

export const SelectPluginsDrawer = observer(SelectPluginsDrawerCore);
