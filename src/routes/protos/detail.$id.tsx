import { useEffect } from 'react';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { req } from '@/config/req';
import { useQuery } from '@tanstack/react-query';
import { API_PROTOS } from '@/config/constant';
import PageHeader from '@/components/page/PageHeader';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DevTool } from '@hookform/devtools';
import { Skeleton } from '@mantine/core';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';

const ProtoDetailForm = ({ id }: { id: string }) => {
  const { data: protoData, isLoading } = useQuery({
    queryKey: ['proto', id],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespProtoDetail']>(`${API_PROTOS}/${id}`)
        .then((v) => v.data),
  });

  const form = useForm<APISIXType['Proto']>({
    resolver: zodResolver(APISIX.Proto),
    shouldUnregister: true,
    mode: 'onChange',
    disabled: true,
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
        <FormSectionGeneral />
        <FormPartProto allowUpload={false} />
        <DevTool control={form.control} />
      </FormTOCBox>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/protos/detail/$id' });

  return (
    <>
      <PageHeader title={t('protos.detail.title')} />
      <ProtoDetailForm id={id} />
    </>
  );
}

export const Route = createFileRoute('/protos/detail/$id')({
  component: RouteComponent,
});
