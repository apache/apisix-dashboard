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
