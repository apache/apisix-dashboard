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
import { Button, Menu } from '@mantine/core';
import type { LinkProps } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { RouteLinkBtn } from '@/components/Btn';
import type { FileRoutesByTo } from '@/routeTree.gen';
import IconPlus from '~icons/material-symbols/add';
import IconCode from '~icons/material-symbols/code';
import IconChevronDown from '~icons/material-symbols/expand-more';
import IconForm from '~icons/material-symbols/list-alt';

export type ToAddPageBtnProps = {
  to: keyof FilterKeys<FileRoutesByTo, 'add'>;
  label: string;
} & Pick<LinkProps, 'params'>;

export const ToAddPageBtn = ({ to, params, label }: ToAddPageBtnProps) => {
  return (
    <RouteLinkBtn
      leftSection={<IconPlus />}
      size="compact-sm"
      variant="gradient"
      to={to}
      params={params}
    >
      {label}
    </RouteLinkBtn>
  );
};

export type ToAddPageDropdownProps = {
  to: string;
  label: string;
  params?: Record<string, string>;
};

export const ToAddPageDropdown = ({ to, label, params }: ToAddPageDropdownProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFormClick = () => {
    navigate({ to, params });
  };

  const handleJsonClick = () => {
    navigate({ to, params, search: { mode: 'json' } });
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          leftSection={<IconPlus />}
          rightSection={<IconChevronDown />}
          size="compact-sm"
          variant="gradient"
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconForm />} onClick={handleFormClick}>
          {t('form.view.createWithForm')}
        </Menu.Item>
        <Menu.Item leftSection={<IconCode />} onClick={handleJsonClick}>
          {t('form.view.createWithJSON')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export type ToDetailPageBtnProps = {
  to:
    | keyof FilterKeys<FileRoutesByTo, '$id'>
    | keyof FilterKeys<FileRoutesByTo, '$routeId'>
    | keyof FilterKeys<FileRoutesByTo, '$username'>;
} & Pick<LinkProps, 'params'>;
export const ToDetailPageBtn = (props: ToDetailPageBtnProps) => {
  const { params, to } = props;
  const { t } = useTranslation();
  return (
    <RouteLinkBtn size="compact-xs" variant="light" to={to} params={params}>
      {t('form.btn.view')}
    </RouteLinkBtn>
  );
};

export type ToDetailPageDropdownProps = {
  to: string;
  params: Record<string, string>;
};

export const ToDetailPageDropdown = ({ to, params }: ToDetailPageDropdownProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFormClick = () => {
    navigate({ to, params });
  };

  const handleJsonClick = () => {
    navigate({ to, params, search: { mode: 'json' } });
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          rightSection={<IconChevronDown />}
          size="compact-xs"
          variant="light"
        >
          {t('form.btn.edit')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconForm />} onClick={handleFormClick}>
          {t('form.view.editWithForm')}
        </Menu.Item>
        <Menu.Item leftSection={<IconCode />} onClick={handleJsonClick}>
          {t('form.view.editWithJSON')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
