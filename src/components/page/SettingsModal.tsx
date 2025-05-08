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
import { Modal, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/config/global';
import { globalStore } from '@/stores/global';

export const SettingsModal = () => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={globalStore.settings.isOpen}
      onClose={() => globalStore.settings.set('isOpen', false)}
      centered
      title={t('settings.title')}
    >
      <TextInput
        label={t('settings.adminKey')}
        value={globalStore.settings.adminKey}
        onChange={(e) => {
          globalStore.settings.set('adminKey', e.currentTarget.value);
          setTimeout(() => {
            queryClient.invalidateQueries();
            queryClient.refetchQueries();
          });
        }}
        required
      />
    </Modal>
  );
};
