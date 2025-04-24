import { useAppForm } from '@/components/form';
import { A6, type A6Type } from '@/types/schema/apisix';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { zGetDefault } from '@/utils/zod';
import { pipeProduce } from '@/utils/producer';
import {} from 'axios';
import { produceTimeout } from '@/utils/form-producer';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_UPSTREAMS } from '@/config/constant';
import { FormPartBasic } from '@/components/form-slice/FormPartBasic';
import PageHeader from '@/components/page/PageHeader';
export const UpstreamPostSchema = A6.Upstream;

const UpstreamAddForm = () => {
  const { t } = useTranslation();
  const postRoute = useMutation({
    mutationFn: (data: object) =>
      req.post<A6Type['Upstream'], A6Type['RespUpstreamList']>(
        API_UPSTREAMS,
        data
      ),
  });
  const form = useAppForm({
    defaultValues: zGetDefault(UpstreamPostSchema),
    validators: {
      onChange: UpstreamPostSchema,
    },
    async onSubmit(data) {
      const form = pipeProduce(produceTimeout)(data.value);
      await postRoute.mutateAsync(form);
    },
  });

  return (
    <form>
      <form.AppForm>
        <FormPartBasic form={form as never} />
        <form.SubmitBtn>{t('form.btn.add')}</form.SubmitBtn>
      </form.AppForm>
    </form>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('upstreams.add.title')} />
      <UpstreamAddForm />
    </>
  );
}

export const Route = createFileRoute('/upstreams/add')({
  component: RouteComponent,
});
