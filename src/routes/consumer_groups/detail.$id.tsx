import { createFileRoute, useParams } from '@tanstack/react-router';
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
  getConsumerGroupQueryOptions,
  putConsumerGroupReq,
} from '@/apis/consumer_groups';
import { pipeProduce } from '@/utils/producer';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';

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
  const initialValue = data.value;

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

  // Reset form when initialValue changes
  useEffect(() => {
    form.reset(initialValue);
  }, [form, initialValue]);

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

  return (
    <>
      <PageHeader
        title={t('consumerGroups.edit.title')}
        {...(readOnly && {
          title: t('consumerGroups.detail.title'),
          extra: (
            <Button
              onClick={() => setReadOnly(false)}
              size="compact-sm"
              variant="gradient"
            >
              {t('form.btn.edit')}
            </Button>
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
