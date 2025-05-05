import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormPartSSL } from '@/components/form-slice/FormPartSSL';
import { Skeleton, Button, Group } from '@mantine/core';
import { getSSLDetailQueryOptions, putSSLReq } from '@/apis/ssls';
import { useBoolean } from 'react-use';
import { notifications } from '@mantine/notifications';
import { FormSubmitBtn } from '@/components/form/Btn';
import { pipeProduce } from '@/utils/producer';
import { useEffect } from 'react';
import {
  SSLPutSchema,
  produceToSSLForm,
} from '@/components/form-slice/FormPartSSL/schema';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const SSLDetailForm = (props: Props & { id: string }) => {
  const { id, readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const {
    data: { value: sslData },
    isLoading,
    refetch,
  } = useSuspenseQuery(getSSLDetailQueryOptions(id));

  const form = useForm({
    resolver: zodResolver(SSLPutSchema),
    shouldUnregister: true,
    mode: 'all',
    disabled: readOnly,
  });

  const putSSL = useMutation({
    mutationFn: putSSLReq,
    async onSuccess() {
      notifications.show({
        message: t('ssls.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  useEffect(() => {
    if (sslData && !isLoading) {
      form.reset(produceToSSLForm(sslData));
    }
  }, [sslData, form, isLoading]);

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormTOCBox>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((d) =>
            putSSL.mutateAsync(pipeProduce()(d))
          )}
        >
          <FormSectionGeneral />
          <FormPartSSL />
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
    </FormTOCBox>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/ssls/detail/$id' });
  const [readOnly, setReadOnly] = useBoolean(true);

  return (
    <>
      <PageHeader
        title={t('ssls.edit.title')}
        {...(readOnly && {
          title: t('ssls.detail.title'),
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
      <SSLDetailForm id={id} readOnly={readOnly} setReadOnly={setReadOnly} />
    </>
  );
}

export const Route = createFileRoute('/ssls/detail/$id')({
  component: RouteComponent,
});
