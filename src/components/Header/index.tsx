import { AppShell, Burger, Group, Image } from '@mantine/core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import apisixLogo from '@/assets/apisix-logo.svg';

import { LanguageMenu } from './LanguageMenu';
import { SettingModalBtn } from './SettingModalBtn';

const Logo = () => {
  return <Image src={apisixLogo} alt="APISIX Logo" width={24} height={24} />;
};

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
};
export const Header: FC<HeaderProps> = (props) => {
  const { opened, toggle } = props;
  const { t } = useTranslation();
  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group h="100%" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo />
          <div>{t('APISIX Dashboard')}</div>
        </Group>
        <Group h="100%" gap="sm">
          <SettingModalBtn />
          <LanguageMenu />
        </Group>
      </Group>
    </AppShell.Header>
  );
};
