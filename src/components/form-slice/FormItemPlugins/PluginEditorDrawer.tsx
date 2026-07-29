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
import { Button, Drawer, Group, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { isAxiosError } from 'axios';
import { isEmpty, isNil } from 'rambdax';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { PluginConfig } from '@/apis/plugins';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormItemEditor } from '@/components/form/Editor';

import type { PluginCardListProps } from './PluginCardList';
import { redactByPaths } from './redact';

// PluginConfig is defined in the API layer (apis/plugins) and re-exported
// here so existing importers keep their path.
export type { PluginConfig };
export type PluginEditorDrawerProps = Pick<PluginCardListProps, 'mode'> & {
  opened: boolean;
  onClose: () => void;
  onSave: (props: PluginConfig) => void | Promise<unknown>;
  plugin: PluginConfig;
  schema?: object;
};

const toConfigStr = (p: object): string => {
  return !isEmpty(p) && !isNil(p) ? JSON.stringify(p, null, 2) : '{}';
};
export const PluginEditorDrawer = (props: PluginEditorDrawerProps) => {
  const { opened, onSave, onClose, plugin, mode, schema } = props;
  const { name, config } = plugin;
  const { t } = useTranslation();
  // The gateway tells us which fields are secret — `encrypt_fields` rides
  // along inside the schema object the drawer already receives, so there is
  // no list to maintain here and nothing extra to fetch.
  const encryptFields = useMemo(
    () => (schema as { encrypt_fields?: string[] })?.encrypt_fields ?? [],
    [schema]
  );
  const [revealed, setRevealed] = useState(false);
  const redacted = useMemo(
    () => redactByPaths(config, encryptFields),
    [config, encryptFields]
  );
  // Only offer the toggle when redaction actually changed something: a
  // control that promises to reveal secrets on a plugin that has none is a
  // lie about the data.
  const hasSecrets = toConfigStr(redacted as object) !== toConfigStr(config);
  const displayConfig =
    mode === 'view' && hasSecrets && !revealed ? (redacted as object) : config;
  const methods = useForm<{ config: string }>({
    criteriaMode: 'all',
    disabled: mode === 'view',
    defaultValues: { config: toConfigStr(displayConfig) },
  });
  const handleClose = () => {
    if (mode !== 'view' && methods.getValues('config') !== toConfigStr(config)) {
      modals.openConfirmModal({
        centered: true,
        title: t('info.unsaved.title'),
        children: <Text size="sm">{t('info.unsaved.content')}</Text>,
        labels: { confirm: t('info.unsaved.confirm'), cancel: t('form.btn.cancel') },
        onConfirm: () => {
          onClose();
          methods.reset();
        },
      });
    } else {
      onClose();
      methods.reset();
    }
  };

  useEffect(() => {
    methods.setValue('config', toConfigStr(displayConfig));
  }, [displayConfig, methods]);

  // A reopened drawer must start redacted; otherwise one reveal leaks into
  // every later view.
  useEffect(() => {
    if (!opened) setRevealed(false);
  }, [opened]);

  return (
    <Drawer
      offset={0}
      radius="md"
      position="right"
      size="md"
      closeOnEscape={false}
      opened={opened}
      onClose={handleClose}
      closeButtonProps={{ 'aria-label': 'Close' }}
      styles={{ body: { paddingTop: '18px' } }}
      {...(mode === 'add' && { title: t('form.plugins.addPlugin') })}
      {...(mode === 'edit' && { title: t('form.plugins.editPlugin') })}
      {...(mode === 'view' && { title: t('form.plugins.viewPlugin') })}
    >
      <Title order={3} mb={10}>
        {name}
      </Title>
      <FormProvider {...methods}>
        {mode === 'view' && hasSecrets && (
          <Button
            mb={10}
            size="compact-xs"
            variant="light"
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed
              ? t('form.plugins.hideSecrets')
              : t('form.plugins.showSecrets')}
          </Button>
        )}
        <form>
          <FormItemEditor
            name="config"
            h={500}
            customSchema={schema}
            isLoading={!schema}
            required
            disabled={mode === 'view'}
          />
        </form>

        {mode !== 'view' && (
          <Group justify="flex-end" mt={8}>
            <FormSubmitBtn
              size="xs"
              variant="light"
              onClick={methods.handleSubmit(async ({ config }) => {
                try {
                  await onSave({ name, config: JSON.parse(config) });
                } catch (e) {
                  // the axios interceptor owns the error toast; keep the
                  // drawer open with the edits intact so the save can be
                  // retried, and rethrow non-axios errors (real bugs)
                  if (!isAxiosError(e)) throw e;
                  return;
                }
                onClose();
                methods.reset();
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
