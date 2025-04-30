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
import { APISIX } from '@/types/schema/apisix';
import { getRouteQueryOptions, putRouteReq } from '@/apis/routes';
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import { pipeProduce } from '@/utils/producer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const RouteDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/routes/detail/$id' });

  const routeQuery = useQuery(getRouteQueryOptions(id));
  const { data: routeData, isLoading, refetch } = routeQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.Route),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (routeData?.value && !isLoading) {
      form.reset(routeData.value);
    }
  }, [routeData, form, isLoading]);

  const putRoute = useMutation({
    mutationFn: putRouteReq,
    async onSuccess() {
      notifications.show({
        message: t('route.edit.success'),
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
          putRoute.mutateAsync(pipeProduce()(d));
        })}
      >
        <FormSectionGeneral />
        <FormPartRoute />
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
        title={t('route.edit.title')}
        {...(readOnly && {
          title: t('route.detail.title'),
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
        <RouteDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/routes/detail/$id')({
  component: RouteComponent,
});
