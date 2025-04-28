import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DevTool } from '@hookform/devtools';
import type { A6Type } from '@/types/schema/apisix';
import { useRouter as useReactRouter } from '@tanstack/react-router';
import { notifications } from '@mantine/notifications';
import { A6 } from '@/types/schema/apisix';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { nanoid } from 'nanoid';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { putGlobalRuleReq } from '@/apis/plugins';

const GlobalRuleAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const putGlobalRule = useMutation({
    mutationFn: putGlobalRuleReq,
  });

  const form = useForm({
    resolver: zodResolver(A6.GlobalRulePut),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {
      plugins: {},
      id: nanoid(),
    },
    mode: 'onChange',
  });

  const submit = async (data: A6Type['GlobalRulePut']) => {
    const res = await putGlobalRule.mutateAsync(data);
    notifications.show({
      id: 'add-global-rule',
      message: t('globalRules.add.success'),
      color: 'green',
    });
    await router.navigate({
      to: '/global-rules/detail/$id',
      params: { id: res.data.value.id },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartGlobalRules />
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
      <PageHeader title={t('globalRules.add.title')} />
      <FormTOCBox>
        <GlobalRuleAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/global-rules/add')({
  component: RouteComponent,
});
