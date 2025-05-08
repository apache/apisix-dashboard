import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
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
import { APISIX } from '@/types/schema/apisix';
import {
  getStreamRouteQueryOptions,
  putStreamRouteReq,
} from '@/apis/stream_routes';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import { pipeProduce } from '@/utils/producer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_STREAM_ROUTES } from '@/config/constant';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const StreamRouteDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/stream_routes/detail/$id' });

  const streamRouteQuery = useQuery(getStreamRouteQueryOptions(id));
  const { data: streamRouteData, isLoading, refetch } = streamRouteQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.StreamRoute),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (streamRouteData?.value && !isLoading) {
      form.reset(streamRouteData.value);
    }
  }, [streamRouteData, form, isLoading]);

  const putStreamRoute = useMutation({
    mutationFn: putStreamRouteReq,
    async onSuccess() {
      notifications.show({
        message: t('streamRoutes.edit.success'),
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
          putStreamRoute.mutateAsync(pipeProduce()(d));
        })}
      >
        <FormSectionGeneral />
        <FormPartStreamRoute />
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
  const { id } = useParams({ from: '/stream_routes/detail/$id' });
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('streamRoutes.edit.title')}
        {...(readOnly && {
          title: t('streamRoutes.detail.title'),
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
                name={t('streamRoutes.singular')}
                target={id}
                api={`${API_STREAM_ROUTES}/${id}`}
                onSuccess={() => navigate({ to: '/stream_routes' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <StreamRouteDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/stream_routes/detail/$id')({
  component: RouteComponent,
});
