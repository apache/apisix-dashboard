import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_PLUGIN_GLOBAL_RULES } from '@/config/constant';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DevTool } from '@hookform/devtools';
import type { A6Type } from '@/types/schema/apisix';
import { useRouter as useReactRouter } from '@tanstack/react-router';
import { notifications } from '@mantine/notifications';
import { A6 } from '@/types/schema/apisix';
import { FormItemPlugins } from '@/components/form-slice/FormItemPlugins';

const defaultValues: A6Type['PluginGlobalRulePost'] = {
  plugins: {},
};

const PluginGlobalRuleAddForm = () => {
  const { t } = useTranslation();
  const router = useReactRouter();

  const postPluginGlobalRule = useMutation({
    mutationFn: (data: object) =>
      req.post<
        A6Type['PluginGlobalRulePost'],
        A6Type['RespPluginGlobalRuleList']
      >(API_PLUGIN_GLOBAL_RULES, data),
  });

  const form = useForm({
    resolver: zodResolver(A6.PluginGlobalRulePost),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues,
    mode: 'onChange',
  });

  const submit = async (data: A6Type['PluginGlobalRulePost']) => {
    await postPluginGlobalRule.mutateAsync(data);
    notifications.show({
      id: 'add-plugin-global-rule',
      message: t('pluginGlobalRules.add.success'),
      color: 'green',
    });
    await router.navigate({ to: '/plugin-global-rules' });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormItemPlugins name="plugins" />
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
      <PluginGlobalRuleAddForm />
    </>
  );
}

export const Route = createFileRoute('/plugin-global-rules/add')({
  component: RouteComponent,
});
