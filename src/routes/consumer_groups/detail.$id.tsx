import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group,Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';

import {
  getConsumerGroupQueryOptions,
  putConsumerGroupReq,
} from '@/apis/consumer_groups';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { API_CONSUMER_GROUPS } from '@/config/constant';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

type Props = {
  id: string;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ConsumerGroupDetailForm = (props: Props) => {
  const { id, readOnly, setReadOnly } = props;
  const { t } = useTranslation();

  const consumerGroupQuery = useSuspenseQuery(getConsumerGroupQueryOptions(id));
  const { data } = consumerGroupQuery;

  const putConsumerGroup = useMutation({
    mutationFn: putConsumerGroupReq,
    async onSuccess() {
      notifications.show({
        message: t('consumerGroups.edit.success'),
        color: 'green',
      });
      consumerGroupQuery.refetch();
      setReadOnly(true);
    },
  });

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerGroupPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    form.reset(data.value);
  }, [form, data.value]);

  if (!data) return <Skeleton height={200} />;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putConsumerGroup.mutateAsync(pipeProduce()({ ...d, id }))
        )}
      >
        <FormPartPluginConfig
          generalProps={{ showDate: true }}
          basicProps={{ showName: false }}
        />
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
  const { id } = useParams({ from: '/consumer_groups/detail/$id' });
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('consumerGroups.edit.title')}
        {...(readOnly && {
          title: t('consumerGroups.detail.title'),
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
                name={t('consumerGroups.singular')}
                target={id}
                api={`${API_CONSUMER_GROUPS}/${id}`}
                onSuccess={() => navigate({ to: '/consumer_groups' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <ConsumerGroupDetailForm
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/consumer_groups/detail/$id')({
  component: RouteComponent,
});
