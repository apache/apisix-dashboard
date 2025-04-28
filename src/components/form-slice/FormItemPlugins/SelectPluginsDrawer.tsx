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
  PluginEditorDrawer,
  type PluginEditorDrawerProps,
} from './PluginEditorDrawer';
import { observer } from 'mobx-react-lite';

export type SelectPluginsDrawerProps = Pick<PluginCardListProps, 'plugins'> &
  Pick<PluginEditorDrawerProps, 'onSave' | 'schema'>;
export const SelectPluginsDrawerCore = (props: SelectPluginsDrawerProps) => {
  const { plugins, onSave, schema } = props;
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
          h="80vh"
          search={search}
          onAdd={handleAddPlugin}
          plugins={plugins}
        />
      </Drawer>
      <Button ml={8} onClick={handlers.open}>
        {t('form.plugins.selectPlugins.title')}
      </Button>

      <PluginEditorDrawer
        schema={schema}
        opened={updateOpened}
        onClose={updateHandlers.close}
        plugin={{ name: selectedPlugin, config: {} }}
        mode="add"
        onSave={(props) => {
          onSave(props);
          handlers.close();
        }}
      />
    </Drawer.Stack>
  );
};

export const SelectPluginsDrawer = observer(SelectPluginsDrawerCore);
