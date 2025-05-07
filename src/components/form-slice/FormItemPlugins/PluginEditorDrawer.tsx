import { FormItemEditor } from '@/components/form/Editor';
import { Drawer, Group, Title } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'rambdax';
import { FormSubmitBtn } from '@/components/form/Btn';
import type { PluginCardListProps } from './PluginCardList';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

export type PluginConfig = { name: string; config: object };
export type PluginEditorDrawerProps = Pick<PluginCardListProps, 'mode'> & {
  opened: boolean;
  onClose: () => void;
  onSave: (props: PluginConfig) => void;
  plugin: PluginConfig;
  schema?: object;
};

const toConfigStr = (p: object): string => {
  return !isEmpty(p) ? JSON.stringify(p, null, 2) : '{}';
};
const PluginEditorDrawerCore = (props: PluginEditorDrawerProps) => {
  const { opened, onSave, onClose, plugin, mode, schema } = props;
  const { name, config } = plugin;
  const { t } = useTranslation();
  const methods = useForm<{ config: string }>({
    criteriaMode: 'all',
    disabled: mode === 'view',
    defaultValues: { config: toConfigStr(plugin) },
  });
  const handleClose = () => {
    onClose();
    methods.reset();
  };

  useEffect(() => {
    methods.setValue('config', toConfigStr(config));
  }, [config, methods]);

  return (
    <Drawer
      offset={0}
      radius="md"
      position="right"
      size="md"
      closeOnEscape={false}
      opened={opened}
      onClose={handleClose}
      {...(mode === 'add' && { title: t('form.plugins.addPlugin') })}
      {...(mode === 'edit' && { title: t('form.plugins.editPlugin') })}
      {...(mode === 'view' && { title: t('form.plugins.viewPlugin') })}
    >
      <Title order={3}>{name}</Title>
      <FormProvider {...methods}>
        <form>
          <FormItemEditor
            name="config"
            h={500}
            customSchema={schema}
            required
          />
        </form>

        {mode !== 'view' && (
          <Group justify="flex-end" mt={8}>
            <FormSubmitBtn
              size="xs"
              variant="light"
              onClick={methods.handleSubmit(({ config }) => {
                onSave({ name, config: JSON.parse(config) });
                handleClose();
              })}
            >
              {mode === 'add' && t('form.btn.add')}
              {mode === 'edit' && t('form.btn.save')}
            </FormSubmitBtn>
          </Group>
        )}
      </FormProvider>
    </Drawer>
  );
};

export const PluginEditorDrawer = observer(PluginEditorDrawerCore);
