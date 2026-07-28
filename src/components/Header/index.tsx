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
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  Image,
  Text,
} from '@mantine/core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import apisixLogo from '@/assets/apisix-logo.svg';
import IconDocs from '~icons/tabler/book';

import { LanguageMenu } from './LanguageMenu';
import { SettingModalBtn } from './SettingModalBtn';

const DOCS_URL = 'https://apisix.apache.org/docs/';

const docsAnchorProps = {
  component: 'a',
  href: DOCS_URL,
  target: '_blank',
  rel: 'noopener noreferrer',
  variant: 'light',
} as const;

/**
 * Labelled from `sm` up, icon-only below it. The header also carries the
 * language control, whose label is the whole point of showing it, so Docs —
 * the secondary affordance — is what sheds its label when space runs out.
 * Long locales ("Documentación", "Dokumentation") overflow otherwise.
 */
const DocsBtn = () => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        {...docsAnchorProps}
        visibleFrom="sm"
        size="compact-sm"
        leftSection={<IconDocs aria-hidden focusable="false" />}
      >
        {t('docs')}
      </Button>
      <ActionIcon
        {...docsAnchorProps}
        hiddenFrom="sm"
        size="md"
        aria-label={t('docs')}
      >
        <IconDocs aria-hidden focusable="false" />
      </ActionIcon>
    </>
  );
};

const Logo = () => {
  const { t } = useTranslation();
  return (
    <Image src={apisixLogo} alt={t('apisix.logo')} w={24} h={24} fit="fill" />
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
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group h="100%" gap="sm" wrap="nowrap">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label={t('a11y.toggleNavigation')}
          />
          <Logo />
          {/* Below `sm` the burger appears and the header also carries the
              Docs and language controls; with a long locale (e.g. German
              "Dokumentation"/"Deutsch") that no longer fits on one row and
              the controls overlapped the page content. The logo still
              identifies the app, so drop the wordmark rather than the
              control labels — showing the active language is the point of
              the language button. */}
          <Text visibleFrom="sm">{t('apisix.dashboard')}</Text>
        </Group>
        <Group h="100%" gap="sm" wrap="nowrap">
          <DocsBtn />
          <SettingModalBtn />
          <LanguageMenu />
        </Group>
      </Group>
    </AppShell.Header>
  );
};
