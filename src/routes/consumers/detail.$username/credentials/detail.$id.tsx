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
  getCredentialQueryOptions,
  putCredentialReq,
} from '@/apis/credentials';
import { FormPartCredential } from '@/components/form-slice/FormPartCredential';
import { pipeProduce } from '@/utils/producer';
import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_CREDENTIALS } from '@/config/constant';

type CredentialFormProps = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const CredentialDetailForm = (props: CredentialFormProps) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { username, id } = useParams({
    from: '/consumers/detail/$username/credentials/detail/$id',
  });

  const {
    data: credentialData,
    isLoading,
    refetch,
  } = useSuspenseQuery(getCredentialQueryOptions(username, id));

  const form = useForm({
    resolver: zodResolver(APISIX.CredentialPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (credentialData?.value && !isLoading) {
      form.reset(credentialData.value);
    }
  }, [credentialData, form, isLoading]);

  const putCredential = useMutation({
    mutationFn: putCredentialReq,
    async onSuccess() {
      notifications.show({
        message: t('consumers.credentials.edit.success'),
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
          putCredential.mutateAsync({
            username,
            ...pipeProduce()(d),
          });
        })}
      >
        <FormPartCredential showDate />
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
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const { username, id } = useParams({
    from: '/consumers/detail/$username/credentials/detail/$id',
  });
  const navigate = useNavigate();

  return (
    <>
      <DetailCredentialsTabs />
      <PageHeader
        title={t('consumers.credentials.edit.title')}
        {...(readOnly && {
          title: t('consumers.credentials.detail.title'),
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
                key="delete"
                name={t('consumers.credentials.singular')}
                target={id}
                api={`${API_CREDENTIALS(username)}/${id}`}
                onSuccess={() =>
                  navigate({ to: `/consumers/detail/${username}/credentials` })
                }
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <CredentialDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/detail/$id'
)({
  component: RouteComponent,
});
