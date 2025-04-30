import { useEffect } from 'react';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import PageHeader from '@/components/page/PageHeader';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DevTool } from '@hookform/devtools';
import { Skeleton, Button, Group } from '@mantine/core';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { useBoolean } from 'react-use';
import { notifications } from '@mantine/notifications';
import { FormSubmitBtn } from '@/components/form/Btn';
import { getProtoQueryOptions, putProtoReq } from '@/apis/protos';

type ProtoFormProps = {
  id: string;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ProtoDetailForm = ({ id, readOnly, setReadOnly }: ProtoFormProps) => {
  const { t } = useTranslation();
  const {
    data: protoData,
    isLoading,
    refetch,
  } = useSuspenseQuery(getProtoQueryOptions(id));

  const form = useForm<APISIXType['Proto']>({
    resolver: zodResolver(APISIX.Proto),
    shouldUnregister: true,
    mode: 'all',
    disabled: readOnly,
  });

  const putProto = useMutation({
    mutationFn: putProtoReq,
    async onSuccess() {
      notifications.show({
        message: t('protos.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (protoData?.value) {
      form.reset(protoData.value);
    }
  }, [protoData, form]);

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <FormTOCBox>
        <form onSubmit={form.handleSubmit((d) => putProto.mutateAsync(d))}>
          <FormSectionGeneral />
          <FormPartProto allowUpload={!readOnly} />
          {!readOnly && (
            <Group>
              <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
              <Button variant="outline" onClick={() => setReadOnly(true)}>
                {t('form.btn.cancel')}
              </Button>
            </Group>
          )}
          <DevTool control={form.control} />
        </form>
      </FormTOCBox>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/protos/detail/$id' });
  const [readOnly, setReadOnly] = useBoolean(true);

  return (
    <>
      <PageHeader
        title={readOnly ? t('protos.detail.title') : t('protos.edit.title')}
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
      <ProtoDetailForm id={id} readOnly={readOnly} setReadOnly={setReadOnly} />
    </>
  );
}

export const Route = createFileRoute('/protos/detail/$id')({
  component: RouteComponent,
});
