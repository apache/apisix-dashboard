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
import { Divider, InputWrapper, Modal, Text, TextInput } from '@mantine/core';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/config/global';
import { adminKeyAtom, isSettingsOpenAtom } from '@/stores/global';
import { sha } from '~build/git';

const AdminKey = () => {
  const { t } = useTranslation();
  const [adminKey, setAdminKey] = useAtom(adminKeyAtom);

  return (
    <TextInput
      label={t('settings.adminKey')}
      value={adminKey}
      onChange={(e) => {
        setAdminKey(e.currentTarget.value);
        setTimeout(() => {
          queryClient.invalidateQueries();
          queryClient.refetchQueries();
        });
      }}
      required
    />
  );
};

const UICommitSha = () => {
  const { t } = useTranslation();
  return (
    <InputWrapper label={t('settings.ui-commit-sha')}>
      <Text c="gray.6" size="sm">
        {sha}
      </Text>
    </InputWrapper>
  );
};

export const SettingsModal = () => {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useAtom(isSettingsOpenAtom);

  return (
    <Modal
      opened={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      centered
      title={t('settings.title')}
    >
      <AdminKey />
      <Divider my="lg" />
      <UICommitSha />
    </Modal>
  );
};
