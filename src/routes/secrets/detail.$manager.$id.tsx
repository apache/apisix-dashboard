import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { notifications } from '@mantine/notifications';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { Skeleton, Button, Group } from '@mantine/core';
import { useBoolean } from 'react-use';
import { useEffect } from 'react';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { getSecretQueryOptions, putSecretReq } from '@/apis/secrets';
import { FormPartSecret } from '@/components/form-slice/FormPartSecret';
import { pipeProduce } from '@/utils/producer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const SecretDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { manager, id } = useParams({ from: '/secrets/detail/$manager/$id' });

  const secretQuery = useQuery(
    getSecretQueryOptions({
      id,
      manager: manager as APISIXType['Secret']['manager'],
    })
  );
  const { data: secretData, isLoading, refetch } = secretQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.Secret),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (secretData?.value && !isLoading) {
      form.reset(secretData.value);
    }
    // readonly is used as a dep to ensure that it can be reset correctly when switching states.
  }, [secretData, form, isLoading, readOnly]);

  const putSecret = useMutation({
    mutationFn: putSecretReq,
    async onSuccess() {
      notifications.show({
        message: t('secrets.edit.success'),
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
          putSecret.mutateAsync(pipeProduce()(d));
        })}
      >
        <FormSectionGeneral readOnlyID />
        <FormPartSecret readOnlyManager />
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

  return (
    <>
      <PageHeader
        title={readOnly ? t('secrets.detail.title') : t('secrets.edit.title')}
        {...(readOnly && {
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
        <SecretDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/secrets/detail/$manager/$id')({
  component: RouteComponent,
});
