import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { Skeleton, Button, Group } from '@mantine/core';
import { useBoolean } from 'react-use';
import { useEffect, useMemo } from 'react';
import { APISIX } from '@/types/schema/apisix';
import { getConsumerQueryOptions, putConsumerReq } from '@/apis/consumers';
import { notifications } from '@mantine/notifications';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { pipeProduce } from '@/utils/producer';
import { Tabs, type TabsItem } from '@/components/page/Tabs';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ConsumerDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { username } = useParams({ from: '/consumers/detail/$username/' });

  const consumerQuery = useSuspenseQuery(getConsumerQueryOptions(username));
  const { data: consumerData, isLoading, refetch } = consumerQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.ConsumerPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (consumerData?.value && !isLoading) {
      form.reset(consumerData.value);
    }
  }, [consumerData, form, isLoading]);

  const putConsumer = useMutation({
    mutationFn: putConsumerReq,
    async onSuccess() {
      notifications.show({
        message: t('consumers.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) => {
          putConsumer.mutateAsync(pipeProduce()(d));
        })}
      >
        <FormSectionGeneral showID={false} />
        <FormPartConsumer />
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

const ConsumerDetailTab = () => {
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);

  return (
    <>
      <PageHeader
        title={t('consumers.edit.title')}
        {...(readOnly && {
          title: t('consumers.detail.title'),
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
        <ConsumerDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const items = useMemo(
    (): TabsItem[] => [
      {
        value: 'detail',
        label: t('consumers.detail.title'),
        content: <ConsumerDetailTab />,
      },
      {
        value: 'credentials',
        label: t('consumers.credentials.title'),
        content: <div>credentials</div>,
      },
    ],
    [t]
  );
  return <Tabs items={items} variant="outline" />;
}

export const Route = createFileRoute('/consumers/detail/$username/')({
  component: RouteComponent,
});
