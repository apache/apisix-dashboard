import { ActionIcon } from '@mantine/core';

import { globalStore } from '@/stores/global';
import IconSettings from '~icons/material-symbols/settings';

export const SettingModalBtn = () => {
  return (
    <ActionIcon
      onClick={() => globalStore.settings.set('isOpen', true)}
      variant="light"
      size="sm"
    >
      <IconSettings />
    </ActionIcon>
  );
};
