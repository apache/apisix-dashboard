import { Menu, ActionIcon } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Resources } from '@/locales/i18n';

const LangMap: Record<keyof Resources, string> = {
  en: 'English',
  zh: '中文',
};

export const LanguageMenu = () => {
  const { i18n } = useTranslation();
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
