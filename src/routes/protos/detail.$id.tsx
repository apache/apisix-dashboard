import { useEffect } from 'react';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
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
import { pipeProduce } from '@/utils/producer';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_PROTOS } from '@/config/constant';

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
        <form
          onSubmit={form.handleSubmit((d) =>
            putProto.mutateAsync(pipeProduce()(d))
          )}
        >
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
  const { id } = useParams({ from: '/protos/detail/$id' });
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('protos.edit.title')}
        {...(readOnly && {
          title: t('protos.detail.title'),
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
                name={t('protos.singular')}
                target={id}
                api={`${API_PROTOS}/${id}`}
                onSuccess={() => navigate({ to: '/protos' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <ProtoDetailForm
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/protos/detail/$id')({
  component: RouteComponent,
});
