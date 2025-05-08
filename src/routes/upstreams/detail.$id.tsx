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
import { FormPartUpstream } from '@/components/form-slice/FormPartUpstream';
import { FormPartUpstreamSchema } from '@/components/form-slice/FormPartUpstream/schema';
import { Skeleton, Button, Group } from '@mantine/core';
import { getUpstreamReq, putUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';
import { useBoolean } from 'react-use';
import { notifications } from '@mantine/notifications';
import { FormSubmitBtn } from '@/components/form/Btn';
import { produceToUpstreamForm } from '@/components/form-slice/FormPartUpstream/util';
import { pipeProduce } from '@/utils/producer';
import { useEffect } from 'react';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_UPSTREAMS } from '@/config/constant';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const UpstreamDetailForm = (
  props: Props & Pick<APISIXType['Upstream'], 'id'>
) => {
  const { id, readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const {
    data: { value: upstreamData },
    isLoading,
    refetch,
  } = useSuspenseQuery(getUpstreamReq(id));

  const form = useForm({
    resolver: zodResolver(FormPartUpstreamSchema),
    shouldUnregister: true,
    mode: 'all',
    disabled: readOnly,
  });

  const putUpstream = useMutation({
    mutationFn: putUpstreamReq,
    async onSuccess() {
      notifications.show({
        message: t('upstreams.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  useEffect(() => {
    if (upstreamData && !isLoading) {
      form.reset(produceToUpstreamForm(upstreamData));
    }
  }, [upstreamData, form, isLoading]);

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormTOCBox>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((d) => {
            putUpstream.mutateAsync(pipeProduce()(d));
          })}
        >
          <FormSectionGeneral />
          <FormPartUpstream />
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
  const { id } = useParams({ from: '/upstreams/detail/$id' });
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('upstreams.edit.title')}
        {...(readOnly && {
          title: t('upstreams.detail.title'),
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
                name={t('upstreams.singular')}
                target={id}
                api={`${API_UPSTREAMS}/${id}`}
                onSuccess={() => navigate({ to: '/upstreams' })}
              />
            </Group>
          ),
        })}
      />
      <UpstreamDetailForm
        id={id}
        readOnly={readOnly}
        setReadOnly={setReadOnly}
      />
    </>
  );
}

export const Route = createFileRoute('/upstreams/detail/$id')({
  component: RouteComponent,
});
