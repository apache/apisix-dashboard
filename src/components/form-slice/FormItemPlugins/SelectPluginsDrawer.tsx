import { Button, Drawer } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  PluginCardList,
  PluginCardListSearch,
  type PluginCardListProps,
} from './PluginCardList';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import {
  UpdatePluginDrawer,
  type UpdatePluginDrawerProps,
} from './UpdatePluginDrawer';

export type SelectPluginsDrawerProps = Pick<PluginCardListProps, 'plugins'> &
  Pick<UpdatePluginDrawerProps, 'onSave'>;
export const SelectPluginsDrawer = (props: SelectPluginsDrawerProps) => {
  const { plugins, onSave } = props;
  const { t } = useTranslation();
  const [opened, handlers] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [updateOpened, updateHandlers] = useDisclosure(false);

  const handleAddPlugin = (name: string) => {
    setSelectedPlugin(name);
    updateHandlers.open();
  };

  return (
    <Drawer.Stack>
      <Drawer
        offset={0}
        radius="md"
        position="right"
        size="xl"
        closeOnEscape={false}
        opened={opened}
        onClose={handlers.close}
        title={t('form.plugins.selectPlugins.title')}
      >
        <Drawer.Header p={0} mih="60px">
          <PluginCardListSearch search={search} setSearch={setSearch} />
        </Drawer.Header>

        <PluginCardList
          mode="add"
          cols={2}
          search={search}
          onAdd={handleAddPlugin}
          plugins={plugins}
        />
      </Drawer>
      <Button ml={8} onClick={handlers.open}>
        {t('form.plugins.selectPlugins.title')}
      </Button>

      <UpdatePluginDrawer
        opened={updateOpened}
        onClose={updateHandlers.close}
        name={selectedPlugin}
        config={{}}
        mode="add"
        onSave={(props) => {
          onSave(props);
          handlers.close();
        }}
      />
    </Drawer.Stack>
  );
};
