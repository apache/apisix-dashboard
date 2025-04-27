import { useEffect } from 'react';
import { A6, type A6Type } from '@/types/schema/apisix';
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
import { FormSectionInfo } from '@/components/form-slice/FormSectionInfo';

const ProtoDetailForm = ({ id }: { id: string }) => {
  const { data: protoData, isLoading } = useQuery({
    queryKey: ['proto', id],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespProtoDetail']>(`${API_PROTOS}/${id}`)
        .then((v) => v.data),
  });

  const form = useForm<A6Type['Proto']>({
    resolver: zodResolver(A6.Proto),
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
        <FormSectionInfo />
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
