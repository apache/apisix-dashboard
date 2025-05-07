import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { notifications } from '@mantine/notifications';
import { FormPartSecret } from '@/components/form-slice/FormPartSecret';
import { putSecretReq } from '@/apis/secrets';
import { nanoid } from 'nanoid';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';

const SecretAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const putSecret = useMutation({
    mutationFn: putSecretReq,
    async onSuccess() {
      notifications.show({
        message: t('secrets.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/secrets',
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.Secret),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {
      id: nanoid(),
      manager: APISIX.Secret.options[0].shape.manager.value,
    },
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putSecret.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormSectionGeneral showDate={false} />
        <FormPartSecret />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('secrets.add.title')} />
      <FormTOCBox>
        <SecretAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/secrets/add')({
  component: RouteComponent,
});
