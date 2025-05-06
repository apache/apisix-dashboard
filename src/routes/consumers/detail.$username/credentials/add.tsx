import { putCredentialReq } from '@/apis/credentials';
import { FormPartCredential } from '@/components/form-slice/FormPartCredential';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import PageHeader from '@/components/page/PageHeader';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const CredentialAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { username } = useParams({
    from: '/consumers/detail/$username/credentials/add',
  });

  const putCredential = useMutation({
    mutationFn: putCredentialReq,
    async onSuccess() {
      notifications.show({
        message: t('consumers.credentials.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/consumers/detail/$username/credentials',
        params: { username },
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.CredentialPut),
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
          putCredential.mutateAsync({ username, ...pipeProduce()(d) })
        )}
      >
        <FormPartCredential />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};
function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <DetailCredentialsTabs />
      <PageHeader title={t('consumers.credentials.add.title')} />
      <FormTOCBox>
        <CredentialAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/add'
)({
  component: RouteComponent,
});
