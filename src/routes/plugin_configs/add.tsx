import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { notifications } from '@mantine/notifications';
import { pipeProduce } from '@/utils/producer';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { APISIX } from '@/types/schema/apisix';
import { putPluginConfigReq } from '@/apis/plugin_configs';
import { nanoid } from 'nanoid';

const PluginConfigAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putPluginConfig = useMutation({
    mutationFn: putPluginConfigReq,
    async onSuccess(response) {
      notifications.show({
        message: t('pluginConfigs.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/plugin_configs/detail/$id',
        params: { id: response.data.value.id },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.PluginConfigPut),
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
          putPluginConfig.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartPluginConfig showDate={false} />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('pluginConfigs.add.title')} />
      <FormTOCBox>
        <PluginConfigAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/plugin_configs/add')({
  component: RouteComponent,
});
