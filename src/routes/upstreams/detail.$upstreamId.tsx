import { useEffect } from 'react';
import { type A6Type } from '@/types/schema/apisix';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { req } from '@/config/req';
import { useQuery } from '@tanstack/react-query';
import { API_UPSTREAMS } from '@/config/constant';
import PageHeader from '@/components/page/PageHeader';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormPartUpstream } from '@/components/form-slice/FormPartUpstream';
import {
  FormPartUpstreamSchema,
  type FormPartUpstreamType,
} from '@/components/form-slice/FormPartUpstream/schema';
import { DevTool } from '@hookform/devtools';
import { upstreamdefaultValues } from '@/components/form-slice/FormPartUpstream/config';
import { Skeleton } from '@mantine/core';
import { FormSectionInfo } from '@/components/form-slice/FormSectionInfo';

export const Route = createFileRoute('/upstreams/detail/$upstreamId')({
  component: RouteComponent,
});

const UpstreamDetailForm = ({ upstreamId }: { upstreamId: string }) => {
  // Fetch the upstream details
  const { data: upstreamData, isLoading } = useQuery({
    queryKey: ['upstream', upstreamId],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespUpstreamItem']>(
          `${API_UPSTREAMS}/${upstreamId}`
        )
        .then((v) => v),
  });

  const form = useForm<FormPartUpstreamType>({
    resolver: zodResolver(FormPartUpstreamSchema),
    shouldUnregister: false,
    shouldFocusError: false,
    defaultValues: upstreamdefaultValues,
    mode: 'onChange',
    disabled: true, // Disable all form fields
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (upstreamData?.value) {
      form.reset(upstreamData.value);
    }
  }, [upstreamData, form]);

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <FormTOCBox>
        <FormSectionInfo />
        <FormPartUpstream />
        <DevTool control={form.control} />
      </FormTOCBox>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const { upstreamId } = useParams({ from: '/upstreams/detail/$upstreamId' });

  return (
    <>
      <PageHeader title={t('upstreams.detail.title')} />
      <UpstreamDetailForm upstreamId={upstreamId} />
    </>
  );
}
