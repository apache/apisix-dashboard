import { Button, Drawer } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PluginCardList,
  type PluginCardListProps,
  PluginCardListSearch,
} from './PluginCardList';
import { type PluginEditorDrawerProps } from './PluginEditorDrawer';

export type SelectPluginsDrawerProps = Pick<PluginCardListProps, 'plugins'> &
  Pick<PluginEditorDrawerProps, 'schema'> & {
    onAdd: (name: string) => void;
    opened: boolean;
    setOpened: (open: boolean) => void;
    disabled?: boolean;
  };
/**
 * because we need keep the drawer order when using the Drawer.Stack, so we pass disabled to the btn
 */
export const SelectPluginsDrawerCore = (props: SelectPluginsDrawerProps) => {
  const { plugins, onAdd, opened, setOpened, disabled = false } = props;
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
      {!disabled && (
        <Button ml={8} onClick={() => setOpened(true)}>
          {t('form.plugins.selectPlugins.title')}
        </Button>
      )}
    </>
  );
};

export const SelectPluginsDrawer = observer(SelectPluginsDrawerCore);
