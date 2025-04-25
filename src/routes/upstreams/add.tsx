import { A6, type A6Type } from '@/types/schema/apisix';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {} from 'axios';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_UPSTREAMS } from '@/config/constant';
import { FormPartBasic } from '@/components/form-slice/FormPartBasic';
import PageHeader from '@/components/page/PageHeader';
import { FormSectionTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DevTool } from '@hookform/devtools';
import { FormSubmitBtn } from '@/components/form/Btn';

export const UpstreamPostSchema = A6.Upstream;

const UpstreamAddForm = () => {
  const { t } = useTranslation();
  const postUpstream = useMutation({
    mutationFn: (data: object) =>
      req.post<A6Type['Upstream'], A6Type['RespUpstreamList']>(
        API_UPSTREAMS,
        data
      ),
  });
  const form = useForm({
    resolver: zodResolver(UpstreamPostSchema),
    mode: 'onChange',
  });

  const submit = async (data: A6Type['Upstream']) => {
    await postUpstream.mutateAsync(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartBasic />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
      <DevTool control={form.control} />
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('upstreams.add.title')} />
      <FormSectionTOCBox>
        <UpstreamAddForm />
      </FormSectionTOCBox>
    </>
  );
}

export const Route = createFileRoute('/upstreams/add')({
  component: RouteComponent,
});
