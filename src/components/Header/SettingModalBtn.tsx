import { LOCAL_STORAGE_ADMIN_KEY } from '@/config/constant';
import { ActionIcon, Modal, TextInput } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import IconSettings from '~icons/material-symbols/settings';
import { useTranslation } from 'react-i18next';

export const SettingModalBtn = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { t } = useTranslation();
  const [value, setValue] = useLocalStorage({
    key: LOCAL_STORAGE_ADMIN_KEY,
    defaultValue: '',
  });

  return (
    <>
      <ActionIcon onClick={open} variant="light" size="sm">
        <IconSettings />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={close}
        centered
        title={t('setting.title')}
      >
        <TextInput
          label={t('setting.adminKey')}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        ></TextInput>
      </Modal>
    </>
  );
};
