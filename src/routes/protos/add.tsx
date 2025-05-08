import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute , useRouter as useReactRouter } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postProtoReq } from '@/apis/protos';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import PageHeader from '@/components/page/PageHeader';
import type { APISIXType } from '@/types/schema/apisix';
import { APISIXProtos } from '@/types/schema/apisix/protos';

const defaultValues: APISIXType['ProtoPost'] = {
  content: '',
};

const ProtoAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const postProto = useMutation({
    mutationFn: postProtoReq,
  });

  const form = useForm({
    resolver: zodResolver(APISIXProtos.ProtoPost),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues,
    mode: 'onChange',
  });

  const submit = async (data: APISIXType['ProtoPost']) => {
    await postProto.mutateAsync(data);
    notifications.show({
      id: 'add-proto',
      message: t('protos.add.success'),
      color: 'green',
    });
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
