import {
  AppShell,
  Group,
  Burger,
  Image,
  Menu,
  ActionIcon,
} from '@mantine/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import apisixLogo from '../assets/apisix-logo.svg';
import { Resources } from '../locales/i18n';
import { IconLanguage } from '@tabler/icons-react';

const Logo = () => {
  return <Image src={apisixLogo} alt="APISIX Logo" width={24} height={24} />;
};

const LangMap: Record<keyof Resources, string> = {
  en: 'English',
  zh: '中文',
};

const LanguageMenu = () => {
  const { i18n } = useTranslation();
  console.log(i18n);

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="light" size="sm">
          <IconLanguage />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(LangMap).map((lang) => (
          <Menu.Item
            key={lang}
            onClick={async () => {
              await i18n.changeLanguage(lang);
            }}
          >
            {LangMap[lang as keyof Resources]}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>Help Us Translate！</Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
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
        <LanguageMenu />
      </Group>
    </AppShell.Header>
  );
};
