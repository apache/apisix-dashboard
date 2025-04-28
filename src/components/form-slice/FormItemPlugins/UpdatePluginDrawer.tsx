import { FormItemEditor } from '@/components/form/Editor';
import { Drawer, Group, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getPluginSchemaQueryOptions } from './req';
import { isEmpty } from 'rambdax';
import { FormSubmitBtn } from '@/components/form/Btn';

export type PluginConfig = { name: string; config: object };
export type UpdatePluginDrawerProps = PluginConfig & {
  mode: 'add' | 'edit';
  opened: boolean;
  onClose: () => void;
  onSave: (props: PluginConfig) => void;
};
export const UpdatePluginDrawer = (props: UpdatePluginDrawerProps) => {
  const { opened, onSave, onClose, name, config, mode } = props;
  const { t } = useTranslation();
  const methods = useForm({
    criteriaMode: 'all',
    defaultValues: {
      config: !isEmpty(config) ? JSON.stringify(config, null, 2) : '{}',
    },
  });
  const handleClose = () => {
    methods.reset();
    onClose();
  };
  const getSchemaReq = useQuery(getPluginSchemaQueryOptions(name));

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
    >
      <Title order={3}>{name}</Title>
      <FormProvider {...methods}>
        <form>
          <FormItemEditor
            name="config"
            h={500}
            customSchema={getSchemaReq.data}
            isLoading={getSchemaReq.isLoading}
            required
          />
        </form>
      </FormProvider>

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
          {mode === 'edit' && t('form.btn.edit')}
        </FormSubmitBtn>
      </Group>
    </Drawer>
  );
};
