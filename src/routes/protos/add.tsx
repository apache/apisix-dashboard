import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_PROTOS } from '@/config/constant';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DevTool } from '@hookform/devtools';
import { A6Proto } from '@/types/schema/apisix/proto';
import type { A6Type } from '@/types/schema/apisix';
import { useRouter as useReactRouter } from '@tanstack/react-router';
import { FormPartProto } from '@/components/form-slice/FormPartProto';

const defaultValues: A6Type['ProtoPost'] = {
  content: '',
};

const ProtoAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const postProto = useMutation({
    mutationFn: (data: object) =>
      req.post<A6Type['ProtoPost'], A6Type['RespProtoList']>(API_PROTOS, data),
  });

  const form = useForm({
    resolver: zodResolver(A6Proto.ProtoPost),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues,
    mode: 'onChange',
  });

  const submit = async (data: A6Type['ProtoPost']) => {
    await postProto.mutateAsync(data);
    await router.navigate({ to: '/protos' });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartProto />
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
      <PageHeader title={t('protos.add.title')} />
      <ProtoAddForm />
    </>
  );
}

export const Route = createFileRoute('/protos/add')({
  component: RouteComponent,
});
