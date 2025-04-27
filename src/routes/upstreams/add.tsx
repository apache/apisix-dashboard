import { type A6Type } from '@/types/schema/apisix';
import { createFileRoute } from '@tanstack/react-router';
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
import { DevTool } from '@hookform/devtools';
import { upstreamdefaultValues } from '@/components/form-slice/FormPartUpstream/config';
import type { z } from 'zod';

const PostUpstreamSchema = FormPartUpstreamSchema.omit({
  id: true,
});

type PostUpstreamType = z.infer<typeof PostUpstreamSchema>;

const UpstreamAddForm = () => {
  const { t } = useTranslation();
  const postUpstream = useMutation({
    mutationFn: (data: object) =>
      req.post<PostUpstreamType, A6Type['RespUpstreamList']>(
        API_UPSTREAMS,
        data
      ),
  });
  const form = useForm({
    resolver: zodResolver(PostUpstreamSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: upstreamdefaultValues,
    mode: 'onChange',
  });

  const submit = async (form: PostUpstreamType) => {
    const data = pipeProduce()(form);
    await postUpstream.mutateAsync(data);
  };

  return (
    <FormProvider {...form}>
      <FormTOCBox>
        <form
          onSubmit={form.handleSubmit(submit, (e) =>
            // eslint-disable-next-line no-console
            console.log(e)
          )}
        >
          <FormPartUpstream />
          <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
        </form>
        <DevTool control={form.control} />
      </FormTOCBox>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('upstreams.add.title')} />
      <UpstreamAddForm />
    </>
  );
}

export const Route = createFileRoute('/upstreams/add')({
  component: RouteComponent,
});
