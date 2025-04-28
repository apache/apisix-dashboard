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
import { FormPartPluginGlobalRules } from '@/components/form-slice/FormPartPluginGlobalRules';
import { putPluginGlobalRuleReq } from '@/apis/plugins';

const PluginGlobalRuleAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const putPluginGlobalRule = useMutation({
    mutationFn: putPluginGlobalRuleReq,
  });

  const form = useForm({
    resolver: zodResolver(A6.PluginGlobalRulePut),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {
      plugins: {},
      id: nanoid(),
    },
    mode: 'onChange',
  });

  const submit = async (data: A6Type['PluginGlobalRulePut']) => {
    const res = await putPluginGlobalRule.mutateAsync(data);
    notifications.show({
      id: 'add-plugin-global-rule',
      message: t('pluginGlobalRules.add.success'),
      color: 'green',
    });
    await router.navigate({
      to: '/plugin-global-rules/detail/$id',
      params: { id: res.data.value.id },
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartPluginGlobalRules />
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
      <PageHeader title={t('pluginGlobalRules.add.title')} />
      <FormTOCBox>
        <PluginGlobalRuleAddForm />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/plugin-global-rules/add')({
  component: RouteComponent,
});
