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
import { getServiceQueryOptions, putServiceReq } from '@/apis/services';
import { FormPartService } from '@/components/form-slice/FormPartService';
import { pipeProduce } from '@/utils/producer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { API_SERVICES } from '@/config/constant';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ServiceDetailForm = (props: Props) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { id } = useParams({ from: '/services/detail/$id' });

  const serviceQuery = useQuery(getServiceQueryOptions(id));
  const { data: serviceData, isLoading, refetch } = serviceQuery;

  const form = useForm({
    resolver: zodResolver(APISIX.Service),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (serviceData?.value && !isLoading) {
      form.reset(serviceData.value);
    }
  }, [serviceData, form, isLoading]);

  const putService = useMutation({
    mutationFn: putServiceReq,
    async onSuccess() {
      notifications.show({
        message: t('services.edit.success'),
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
          putService.mutateAsync(pipeProduce()(d));
        })}
      >
        <FormSectionGeneral />
        <FormPartService />
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
  const { id } = useParams({ from: '/services/detail/$id' });
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('services.edit.title')}
        {...(readOnly && {
          title: t('services.detail.title'),
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
                resource={t('services.singular')}
                target={id}
                api={`${API_SERVICES}/${id}`}
                onSuccess={() => navigate({ to: '/services' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <ServiceDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/services/detail/$id')({
  component: RouteComponent,
});
