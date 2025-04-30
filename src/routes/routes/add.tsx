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
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import { RoutePostSchema } from '@/components/form-slice/FormPartRoute/schema';
import { postRouteReq } from '@/apis/routes';

const RouteAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const postRoute = useMutation({
    mutationFn: postRouteReq,
    async onSuccess() {
      notifications.show({
        message: t('route.add.submit'),
        color: 'green',
      });
      await router.navigate({ to: '/routes' });
    },
  });

  const form = useForm({
    resolver: zodResolver(RoutePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues: {
      status: 1,
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          postRoute.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartRoute />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('route.add.title')} />
      <FormTOCBox>
        <RouteAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/routes/add')({
  component: RouteComponent,
});
