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
import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import IconCode from '~icons/material-symbols/code';
import IconDelete from '~icons/material-symbols/delete';
import IconForm from '~icons/material-symbols/list-alt';
import IconMore from '~icons/material-symbols/more-vert';

export type TableActionMenuProps = {
  /** Resource name for delete confirmation (e.g., "Route") */
  resourceName: string;
  /** Resource ID or name for delete confirmation display */
  resourceTarget: string;
  /** API endpoint for delete request */
  deleteApi: string;
  /** Callback after successful deletion */
  onDeleteSuccess: () => void;
  /** Callback when Form edit is clicked (opens drawer) */
  onFormEdit: () => void;
  /** Callback when JSON edit is clicked (opens drawer) */
  onJsonEdit: () => void;
};

export const TableActionMenu = (props: TableActionMenuProps) => {
  const { resourceName, resourceTarget, deleteApi, onDeleteSuccess, onFormEdit, onJsonEdit } = props;
  const { t } = useTranslation();

  const handleDeleteClick = () => {
    modals.openConfirmModal({
      centered: true,
      confirmProps: { color: 'red' },
      title: t('info.delete.title', { name: resourceName }),
      children: (
        <Text>
          {t('info.delete.content', { name: resourceName })}
          <Text
            component="span"
            fw={700}
            mx="0.25em"
            style={{ wordBreak: 'break-all' }}
          >
            {resourceTarget}
          </Text>
          {t('mark.question')}
        </Text>
      ),
      labels: { confirm: t('form.btn.delete'), cancel: t('form.btn.cancel') },
      onConfirm: () =>
        req
          .delete(deleteApi)
          .then(() => onDeleteSuccess?.())
          .then(() => {
            notifications.show({
              message: t('info.delete.success', { name: resourceName }),
              color: 'green',
            });
            queryClient.invalidateQueries();
          }),
    });
  };

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="sm">
          <IconMore />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconForm />} onClick={onFormEdit}>
          {t('form.view.editWithForm')}
        </Menu.Item>
        <Menu.Item leftSection={<IconCode />} onClick={onJsonEdit}>
          {t('form.view.editWithJSON')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconDelete />} color="red" onClick={handleDeleteClick}>
          {t('form.btn.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
