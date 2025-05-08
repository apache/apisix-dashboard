import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { notifications } from '@mantine/notifications';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { Skeleton, Button, Group } from '@mantine/core';
import { useBoolean } from 'react-use';
import { useEffect } from 'react';
import { APISIX } from '@/types/schema/apisix';
import {
  getPluginConfigQueryOptions,
  putPluginConfigReq,
} from '@/apis/plugin_configs';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { pipeProduce } from '@/utils/producer';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_PLUGIN_CONFIGS } from '@/config/constant';

type Props = {
  id: string;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const PluginConfigDetailForm = (props: Props) => {
  const { id, readOnly, setReadOnly } = props;
  const { t } = useTranslation();

  const pluginConfigQuery = useSuspenseQuery(getPluginConfigQueryOptions(id));
  const { data } = pluginConfigQuery;
  const initialValue = data.value;

  const putPluginConfig = useMutation({
    mutationFn: putPluginConfigReq,
    async onSuccess() {
      notifications.show({
        message: t('pluginConfigs.edit.success'),
        color: 'green',
      });
      pluginConfigQuery.refetch();
      setReadOnly(true);
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.PluginConfigPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  // Reset form when initialValue changes
  useEffect(() => {
    form.reset(initialValue);
  }, [form, initialValue]);

  if (!data) return <Skeleton height={200} />;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putPluginConfig.mutateAsync(pipeProduce()({ ...d, id }))
        )}
      >
        <FormPartPluginConfig />
        {!readOnly && (
          <Group>
            <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
            <Button variant="outline" onClick={() => setReadOnly(true)}>
              {t('form.btn.cancel')}
            </Button>
          </Group>
        )}
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { id } = useParams({ from: '/plugin_configs/detail/$id' });
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('pluginConfigs.edit.title')}
        {...(readOnly && {
          title: t('pluginConfigs.detail.title'),
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
                resource={t('pluginConfigs.singular')}
                target={id}
                api={`${API_PLUGIN_CONFIGS}/${id}`}
                onSuccess={() => navigate({ to: '/plugin_configs' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <PluginConfigDetailForm
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/plugin_configs/detail/$id')({
  component: RouteComponent,
});
