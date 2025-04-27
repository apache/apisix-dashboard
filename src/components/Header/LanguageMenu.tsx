import { Menu, ActionIcon } from '@mantine/core';
import IconLanguage from '~icons/material-symbols/language-chinese-array';
import { useTranslation } from 'react-i18next';
import type { Resources } from '@/config/i18n';

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
