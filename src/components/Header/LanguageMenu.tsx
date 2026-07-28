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
import { Anchor, Button, Menu } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import i18nProgress from 'virtual:i18n-progress';

import type { Resources } from '@/config/i18n';
import IconLanguage from '~icons/tabler/language';

const LangMap: Record<keyof Resources, string> = {
  en: 'English',
  de: 'Deutsch',
  zh: '中文',
  es: 'Español',
  tr: 'Türkçe',
};

const TranslationProgress = ({ lang }: { lang: string }) => {
  const percent = i18nProgress[lang as keyof typeof i18nProgress]?.percent;
  if (typeof percent === 'number' && percent < 100) {
    return (
      <span
        style={{
          color: 'var(--mantine-color-gray-6)',
        }}
      >
        ({percent}%)
      </span>
    );
  }
  return null;
};

export const LanguageMenu = () => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ??
    i18n.language) as keyof Resources;
  // Fall back to the raw code so an unmapped locale still shows something.
  const currentLabel = LangMap[current] ?? current;
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        {/* Pairing the icon with the active language name makes the current
            state readable at a glance instead of hidden behind a click. The
            accessible name keeps the `a11y.selectLanguage` prefix — it states
            the control's purpose and contains the visible text, so it
            satisfies WCAG 2.5.3 (Label in Name). */}
        <Button
          variant="light"
          size="compact-sm"
          leftSection={<IconLanguage aria-hidden focusable="false" />}
          aria-label={`${t('a11y.selectLanguage')}: ${currentLabel}`}
        >
          {currentLabel}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(LangMap).map((lang) => (
          <Menu.Item
            key={lang}
            {...(lang === i18n.language && {
              disabled: true,
              style: {
                backgroundColor:
                  'var(--menu-item-hover, var(--mantine-color-gray-1))',
              },
            })}
            onClick={async () => {
              await i18n.changeLanguage(lang);
            }}
          >
            {LangMap[lang as keyof Resources]}
            <TranslationProgress lang={lang} />
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Label>
          <Anchor
            href="https://github.com/apache/apisix-dashboard/issues/1407"
            target="_blank"
            size="xs"
          >
            {t('help-us-translate')}
          </Anchor>
        </Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
};
