import { Button, type ButtonProps,Text } from '@mantine/core';
import { useCallbackRef } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

import { req } from '@/config/req';

type DeleteResourceProps = {
  name: string;
  api: string;
  target?: string;
  onSuccess?: ((res: AxiosResponse<unknown, unknown>) => void) | (() => void);
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
      title: t('msg.delete.title', { name: name }),
      children: (
        <Text>
          {t('msg.delete.content', { name: name })}
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
        req.delete(api).then((res) => {
          notifications.show({
            message: t('msg.delete.success', { name: name }),
            color: 'green',
          });
          onSuccess?.(res);
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
