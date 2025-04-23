import { useAppForm } from '@/components/form';
import { A6, type A6Type } from '@/types/schema/apisix';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { zGetDefault, zOneOf } from '@/utils/zod';
import { pipeProduce } from '@/utils/producer';
import {} from 'axios';
import { produceTimeout } from '@/utils/form-producer';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_ROUTES } from '@/config/constant';
export const RoutePostSchema = A6.Route.omit({
  status: true,
});

const RouteAddForm = () => {
  const { t } = useTranslation();
  const postRoute = useMutation({
    mutationFn: (data: object) =>
      req.post<A6Type['Route'], A6Type['RespRouteList']>(API_ROUTES, data),
  });
  const form = useAppForm({
    defaultValues: zGetDefault(RoutePostSchema),
    validators: {
      onChange: RoutePostSchema.superRefine(zOneOf('uri', 'uris')),
    },
    async onSubmit(data) {
      const form = pipeProduce(produceTimeout)(data.value);
      await postRoute.mutateAsync(form);
    },
  });

  return (
    <form>
      <form.AppForm>
        <form.Section legend={t('form.basic.title')}>
          <form.AppField
            name="name"
            children={(field) => (
              <field.Text label={t('route.add.form.name')} />
            )}
          />
          <form.AppField
            name="desc"
            children={(field) => (
              <field.Textarea label={t('route.add.form.desc')} />
            )}
          />
        </form.Section>
        <form.Section>
          <form.AppField
            name="uri"
            children={(field) => (
              <field.Text label={t('route.add.form.uri')} withAsterisk />
            )}
          />
          <form.AppField
            name="uris"
            children={(field) => (
              <field.TextArray label={t('route.add.form.uris')} withAsterisk />
            )}
          />
        </form.Section>
        <form.Section
          legend={t('form.upstream.title')}
          aria-required
        ></form.Section>
        <form.SubmitBtn>{t('form.btn.add')}</form.SubmitBtn>
      </form.AppForm>
    </form>
  );
};

function RouteComponent() {
  return <RouteAddForm />;
}

export const Route = createFileRoute('/route/add')({
  component: RouteComponent,
});
