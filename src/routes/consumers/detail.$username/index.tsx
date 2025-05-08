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
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { Skeleton, Button, Group } from '@mantine/core';
import { useBoolean } from 'react-use';
import { useEffect } from 'react';
import { APISIX } from '@/types/schema/apisix';
import { getConsumerQueryOptions, putConsumerReq } from '@/apis/consumers';
import { notifications } from '@mantine/notifications';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { pipeProduce } from '@/utils/producer';
import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_CONSUMERS } from '@/config/constant';

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
  const { username } = useParams({ from: '/consumers/detail/$username/' });
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('consumers.edit.title')}
        {...(readOnly && {
          title: t('consumers.detail.title'),
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
                resource={t('consumers.singular')}
                target={username}
                api={`${API_CONSUMERS}/${username}`}
                onSuccess={() => navigate({ to: '/consumer_groups' })}
              />
            </Group>
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
  return (
    <>
      <DetailCredentialsTabs />
      <ConsumerDetailTab />
    </>
  );
}

export const Route = createFileRoute('/consumers/detail/$username/')({
  component: RouteComponent,
});
