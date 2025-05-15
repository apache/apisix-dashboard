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
import { Button, type ButtonProps, Text } from '@mantine/core';
import { useCallbackRef } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/config/global';
import { req } from '@/config/req';

type DeleteResourceProps = {
  name: string;
  api: string;
  target?: string;
  onSuccess?:
    | ((res: AxiosResponse<unknown, unknown>) => void)
    | ((res: AxiosResponse<unknown, unknown>) => Promise<void>)
    | (() => void)
    | (() => Promise<void>);
  DeleteBtn?: typeof Button;
  mode?: 'detail' | 'list';
} & ButtonProps;
export const DeleteResourceBtn = (props: DeleteResourceProps) => {
  const {
    name,
    target,
    api,
    onSuccess,
    DeleteBtn,
    mode = 'list',
    ...btnProps
  } = props;
  const { t } = useTranslation();
  const openModal = useCallbackRef(() =>
    modals.openConfirmModal({
      centered: true,
      confirmProps: { color: 'red' },
      title: t('info.delete.title', { name: name }),
      children: (
        <Text>
          {t('info.delete.content', { name: name })}
          {target && (
            <Text
              component="span"
              fw={700}
              mx="0.25em"
              style={{ wordBreak: 'break-all' }}
            >
              {target}
            </Text>
          )}
          {t('mark.question')}
        </Text>
      ),
      labels: { confirm: t('form.btn.delete'), cancel: t('form.btn.cancel') },
      onConfirm: () =>
        req
          .delete(api)
          .then((res) => Promise.resolve(onSuccess?.(res)))
          .then(() => {
            notifications.show({
              message: t('info.delete.success', { name: name }),
              color: 'green',
            });
            // force invalidate all queries
            // because in playwright, if without this, the navigated page will not refresh
            // and the deleted source will not be removed from the list
            // And in normal use, I haven't reproduced this problem.
            // So this is a workaround for now
            // TODO: remove this
            queryClient.invalidateQueries();
          }),
    })
  );
  if (DeleteBtn) {
    return <DeleteBtn onClick={openModal} />;
  }
  return (
    <Button
      onClick={openModal}
      size="compact-xs"
      variant="light"
      {...(mode === 'detail' && {
        size: 'compact-sm',
        variant: 'filled',
      })}
      color="red"
      {...btnProps}
    >
      {t('form.btn.delete')}
    </Button>
  );
};
