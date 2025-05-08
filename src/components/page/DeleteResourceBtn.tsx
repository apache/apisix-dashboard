import { req } from '@/config/req';
import { Button, Text, type ButtonProps } from '@mantine/core';
import { useCallbackRef } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type { AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

type DeleteResourceProps = {
  resource: string;
  api: string;
  target?: string;
  onSuccess?: ((res: AxiosResponse<unknown, unknown>) => void) | (() => void);
  DeleteBtn?: typeof Button;
} & ButtonProps;
export const DeleteResourceBtn = (props: DeleteResourceProps) => {
  const { resource, target, api, onSuccess, DeleteBtn, ...btnProps } = props;
  const { t } = useTranslation();
  const openModal = useCallbackRef(() =>
    modals.openConfirmModal({
      centered: true,
      confirmProps: { color: 'red' },
      title: t('msg.delete.title', { name: resource }),
      children: (
        <>
          {t('msg.delete.content', { name: resource })}
          {target && (
            <Text component="span" fw={700}>
              {' '}
              {target}{' '}
            </Text>
          )}
          {t('mark.question')}
        </>
      ),
      labels: { confirm: t('form.btn.delete'), cancel: t('form.btn.cancel') },
      onConfirm: () =>
        req.delete(api).then((res) => {
          notifications.show({
            message: t('msg.delete.success', { name: resource }),
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
      color="red"
      {...btnProps}
    >
      {t('form.btn.delete')}
    </Button>
  );
};
