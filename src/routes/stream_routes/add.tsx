import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postStreamRouteReq } from '@/apis/stream_routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import { StreamRoutePostSchema } from '@/components/form-slice/FormPartStreamRoute/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { pipeProduce } from '@/utils/producer';

const StreamRouteAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const postStreamRoute = useMutation({
    mutationFn: postStreamRouteReq,
    async onSuccess() {
      notifications.show({
        message: t('streamRoutes.add.success'),
        color: 'green',
      });
      await router.navigate({ to: '/stream_routes' });
    },
  });

  const form = useForm({
    resolver: zodResolver(StreamRoutePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          postStreamRoute.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartStreamRoute />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('streamRoutes.add.title')} />
      <FormTOCBox>
        <StreamRouteAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/stream_routes/add')({
  component: RouteComponent,
});
