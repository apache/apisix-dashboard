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
