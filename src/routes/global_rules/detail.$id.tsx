import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { DevTool } from '@hookform/devtools';
import type { APISIXType } from '@/types/schema/apisix';
import { notifications } from '@mantine/notifications';
import { APISIX } from '@/types/schema/apisix';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { getGlobalRuleQueryOptions, putGlobalRuleReq } from '@/apis/plugins';
import { useEffect } from 'react';
import { useBoolean } from 'react-use';
import { Button, Group } from '@mantine/core';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_GLOBAL_RULES } from '@/config/constant';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};
const GlobalRuleDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/global_rules/detail/$id' });
  const detailReq = useQuery(getGlobalRuleQueryOptions(id));

  const form = useForm({
    resolver: zodResolver(APISIX.GlobalRulePut),
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

  const putglobalRule = useMutation({
    mutationFn: putGlobalRuleReq,
  });
  const submit = async (data: APISIXType['GlobalRulePut']) => {
    await putglobalRule.mutateAsync(data);
    notifications.show({
      message: t('globalRules.edit.success'),
      color: 'green',
    });
    await detailReq.refetch();
    setReadOnly(true);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartGlobalRules />
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
  const { id } = useParams({ from: '/global_rules/detail/$id' });
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('globalRules.edit.title')}
        {...(readOnly && {
          title: t('globalRules.detail.title'),
          extra: (
            <Group>
              <Button
                onClick={() => setReadOnly(false)}
                size="compact-sm"
                variant="gradient"
              >
                {t('form.btn.edit')}
              </Button>
              <DeleteResourceBtn
                mode="detail"
                resource={t('globalRules.singular')}
                target={id}
                api={`${API_GLOBAL_RULES}/${id}`}
                onSuccess={() => navigate({ to: '/global_rules' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <GlobalRuleDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/global_rules/detail/$id')({
  component: RouteComponent,
});
