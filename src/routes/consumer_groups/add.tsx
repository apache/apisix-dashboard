import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { putConsumerGroupReq } from '@/apis/consumer_groups';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

const ConsumerGroupAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putConsumerGroup = useMutation({
    mutationFn: putConsumerGroupReq,
    async onSuccess(response) {
      notifications.show({
        message: t('consumerGroups.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/consumer_groups/detail/$id',
        params: { id: response.data.value.id },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerGroupPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues: {
      id: nanoid(),
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putConsumerGroup.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartPluginConfig
          generalProps={{ showDate: false }}
          basicProps={{ showName: false }}
        />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('consumerGroups.add.title')} />
      <FormTOCBox>
        <ConsumerGroupAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/consumer_groups/add')({
  component: RouteComponent,
});
