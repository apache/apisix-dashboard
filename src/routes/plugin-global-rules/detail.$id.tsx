import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DevTool } from '@hookform/devtools';
import type { A6Type } from '@/types/schema/apisix';
import { notifications } from '@mantine/notifications';
import { A6 } from '@/types/schema/apisix';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormPartPluginGlobalRules } from '@/components/form-slice/FormPartPluginGlobalRules';
import {
  getPluginGlobalRuleQueryOptions,
  putPluginGlobalRuleReq,
} from '@/apis/plugins';
import { useEffect } from 'react';
import { useBoolean } from 'react-use';
import { Button, Group } from '@mantine/core';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};
const PluginGlobalRuleDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/plugin-global-rules/detail/$id' });
  const detailReq = useQuery(getPluginGlobalRuleQueryOptions(id));

  const form = useForm({
    resolver: zodResolver(A6.PluginGlobalRulePut),
    shouldUnregister: true,
    shouldFocusError: true,
    defaultValues: {},
    mode: 'onChange',
    disabled: readOnly,
  });

  useEffect(() => {
    if (detailReq.data?.value) {
      form.reset(detailReq.data.value);
    }
  }, [detailReq.data, form]);

  const putPluginGlobalRule = useMutation({
    mutationFn: putPluginGlobalRuleReq,
  });
  const submit = async (data: A6Type['PluginGlobalRulePut']) => {
    await putPluginGlobalRule.mutateAsync(data);
    notifications.show({
      message: t('pluginGlobalRules.edit.success'),
      color: 'green',
    });
    await detailReq.refetch();
    setReadOnly(true);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartPluginGlobalRules />
        {!readOnly && (
          <Group>
            <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
            <Button variant="outline" onClick={() => setReadOnly(true)}>
              {t('form.btn.cancel')}
            </Button>
          </Group>
        )}
      </form>
      <DevTool control={form.control} />
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);

  return (
    <>
      <PageHeader
        title={
          readOnly
            ? t('pluginGlobalRules.detail.title')
            : t('pluginGlobalRules.edit.title')
        }
        extra={
          readOnly && (
            <Button
              onClick={() => setReadOnly(false)}
              size="compact-sm"
              variant="gradient"
            >
              {t('form.btn.edit')}
            </Button>
          )
        }
      />
      <FormTOCBox>
        <PluginGlobalRuleDetailForm
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/plugin-global-rules/detail/$id')({
  component: RouteComponent,
});
