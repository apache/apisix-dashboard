import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putConsumerReq } from '@/apis/consumers';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const ConsumerAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putConsumer = useMutation({
    mutationFn: putConsumerReq,
    async onSuccess(_, res) {
      notifications.show({
        message: t('consumers.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/consumers/detail/$username',
        params: { username: res.username },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putConsumer.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartConsumer />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('consumers.add.title')} />
      <FormTOCBox>
        <ConsumerAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/consumers/add')({
  component: RouteComponent,
});
