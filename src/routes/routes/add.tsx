import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postRouteReq } from '@/apis/routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import { RoutePostSchema } from '@/components/form-slice/FormPartRoute/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { pipeProduce } from '@/utils/producer';

const RouteAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const postRoute = useMutation({
    mutationFn: postRouteReq,
    async onSuccess() {
      notifications.show({
        message: t('route.add.success'),
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
