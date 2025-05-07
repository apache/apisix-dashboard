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
import { FormPartService } from '@/components/form-slice/FormPartService';
import { ServicePostSchema } from '@/components/form-slice/FormPartService/schema';
import { postServiceReq } from '@/apis/services';

const ServiceAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const postService = useMutation({
    mutationFn: postServiceReq,
    async onSuccess() {
      notifications.show({
        message: t('services.add.success'),
        color: 'green',
      });
      await router.navigate({ to: '/services' });
    },
  });

  const form = useForm({
    resolver: zodResolver(ServicePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          postService.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartService />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('services.add.title')} />
      <FormTOCBox>
        <ServiceAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/services/add')({
  component: RouteComponent,
});
