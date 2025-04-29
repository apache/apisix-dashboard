import { useEffect } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import { getUpstreamReq } from '@/apis/upstreams';
import type { A6Type } from '@/types/schema/apisix';

export const Route = createFileRoute('/upstreams/detail/$id')({
  component: RouteComponent,
});

const UpstreamDetailForm = (props: Pick<A6Type['Upstream'], 'id'>) => {
  const { id } = props;
  // Fetch the upstream details
  const { data: upstreamData, isLoading } = useQuery(getUpstreamReq(id));

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
  const { id } = useParams({ from: '/upstreams/detail/$id' });

  return (
    <>
      <PageHeader title={t('upstreams.detail.title')} />
      <UpstreamDetailForm id={id} />
    </>
  );
}
