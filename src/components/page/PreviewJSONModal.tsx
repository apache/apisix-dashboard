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
import { Box, Button, CopyButton, Group, Modal, Skeleton, Stack, Tooltip } from '@mantine/core';
import { Editor } from '@monaco-editor/react';
import { useTranslation } from 'react-i18next';

import IconCheck from '~icons/material-symbols/check';
import IconCopy from '~icons/material-symbols/content-copy';

export type PreviewJSONModalProps = {
  opened: boolean;
  onClose: () => void;
  json: string;
  title?: string;
};

export const PreviewJSONModal = ({
  opened,
  onClose,
  json,
  title,
}: PreviewJSONModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title ?? t('form.view.previewJSON')}
      size="xl"
    >
      <Stack gap="md">
        <Box h={500}>
          <Editor
            value={json}
            language="json"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbersMinChars: 3,
              automaticLayout: true,
              stickyScroll: { enabled: false },
            }}
            loading={<Skeleton visible height="100%" width="100%" />}
          />
        </Box>
        <Group justify="flex-end">
          <CopyButton value={json}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t('form.view.copied') : t('form.view.copyToClipboard')}>
                <Button
                  variant="light"
                  leftSection={copied ? <IconCheck /> : <IconCopy />}
                  onClick={copy}
                >
                  {t('form.view.copyToClipboard')}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
          <Button onClick={onClose}>{t('form.btn.cancel')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
