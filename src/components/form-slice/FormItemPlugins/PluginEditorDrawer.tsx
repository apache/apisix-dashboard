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
import { Drawer, Group, Title } from '@mantine/core';
import { isEmpty } from 'rambdax';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormSubmitBtn } from '@/components/form/Btn';
import { FormItemEditor } from '@/components/form/Editor';

import type { PluginCardListProps } from './PluginCardList';

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
export const PluginEditorDrawer = (props: PluginEditorDrawerProps) => {
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
