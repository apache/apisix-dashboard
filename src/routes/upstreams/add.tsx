import { type A6Type } from '@/types/schema/apisix';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {} from 'axios';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_UPSTREAMS } from '@/config/constant';
import PageHeader from '@/components/page/PageHeader';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { pipeProduce } from '@/utils/producer';
import { FormPartUpstream } from '@/components/form-slice/FormPartUpstream';
import { FormPartUpstreamSchema } from '@/components/form-slice/FormPartUpstream/schema';
import type { z } from 'zod';
import { notifications } from '@mantine/notifications';

const PostUpstreamSchema = FormPartUpstreamSchema.omit({
  id: true,
});

type PostUpstreamType = z.infer<typeof PostUpstreamSchema>;

const UpstreamAddForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const postUpstream = useMutation({
    mutationFn: (data: PostUpstreamType) =>
      req.post<unknown, A6Type['RespUpstreamDetail']>(API_UPSTREAMS, data),
    async onSuccess(data) {
      notifications.show({
        message: t('upstreams.add.success'),
        color: 'green',
      });
      await router.navigate({
        to: '/upstreams/detail/$id',
        params: { id: data.data.value.id },
      });
    },
  });
  const form = useForm({
    resolver: zodResolver(PostUpstreamSchema),
    shouldUnregister: true,
    mode: 'all',
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          postUpstream.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormPartUpstream />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('upstreams.add.title')} />
      <FormTOCBox>
        <UpstreamAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/upstreams/add')({
  component: RouteComponent,
});
