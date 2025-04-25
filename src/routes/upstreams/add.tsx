import { A6, type A6Type } from '@/types/schema/apisix';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {} from 'axios';
import { req } from '@/config/req';
import { useMutation } from '@tanstack/react-query';
import { API_UPSTREAMS } from '@/config/constant';
import { FormPartBasic } from '@/components/form-slice/FormPartBasic';
import PageHeader from '@/components/page/PageHeader';
import {
  FormSection,
  FormSectionTOCBox,
} from '@/components/form-slice/FormSection';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormItemNodes } from '@/components/form-slice/FormItemNodes';
import { FormSectionDiscovery } from '@/components/form-slice/FormSectionDiscovery';
import { Divider } from '@mantine/core';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemTextInput } from '@/components/form/TextInput';

export const UpstreamPostSchema = A6.Upstream;

const UpstreamAddForm = () => {
  const { t } = useTranslation();
  const postUpstream = useMutation({
    mutationFn: (data: object) =>
      req.post<A6Type['Upstream'], A6Type['RespUpstreamList']>(
        API_UPSTREAMS,
        data
      ),
  });
  const form = useForm({
    resolver: zodResolver(UpstreamPostSchema),
    mode: 'onChange',
  });

  const submit = async (data: A6Type['Upstream']) => {
    await postUpstream.mutateAsync(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormPartBasic />
        <FormSection legend={t('form.upstream.findUpstreamFrom')}>
          <FormSection legend={t('form.upstream.nodes.title')}>
            <FormItemNodes name="nodes" />
          </FormSection>
          <Divider my="xs" label={t('or')} />
          <FormSectionDiscovery />
        </FormSection>
        <FormSection legend={t('form.upstream.connectionConfiguration')}>
          <FormItemSelect
            control={form.control}
            name="scheme"
            label={t('form.upstream.scheme')}
            defaultValue={A6.UpstreamSchemeL7.options[0].value}
            data={[
              {
                group: 'L7',
                items: A6.UpstreamSchemeL7.options.map((v) => v.value),
              },
              {
                group: 'L4',
                items: A6.UpstreamSchemeL4.options.map((v) => v.value),
              },
            ]}
          />

          <FormSection legend={t('form.upstream.loadBalancing')}>
            <FormItemSelect
              control={form.control}
              name="type"
              label={t('form.upstream.type')}
              defaultValue={A6.UpstreamBalancer.options[0].value}
              data={A6.UpstreamBalancer.options.map((v) => v.value)}
            />
            <FormItemSelect
              control={form.control}
              name="hash_on"
              label={t('form.upstream.hashOn')}
              defaultValue={A6.UpstreamHashOn.options[0].value}
              data={A6.UpstreamHashOn.options.map((v) => v.value)}
              description={t('form.upstream.hashOnDesc')}
            />
            <FormItemTextInput
              control={form.control}
              name="key"
              label={t('form.upstream.key')}
              description={t('form.upstream.keyDesc')}
            />
          </FormSection>

          <FormSection legend={t('form.upstream.passHost')}>
            <FormItemSelect
              control={form.control}
              name="pass_host"
              label={t('form.upstream.passHost')}
              defaultValue={A6.UpstreamPassHost.options[0].value}
              data={A6.UpstreamPassHost.options.map((v) => v.value)}
            />
            <FormItemTextInput
              control={form.control}
              name="upstream_host"
              label={t('form.upstream.upstreamHost')}
              description={t('form.upstream.upstreamHostDesc')}
            />
          </FormSection>

          <FormSection legend={t('form.upstream.retry')}>
            <FormItemNumberInput
              control={form.control}
              name="retries"
              label={t('form.upstream.retries')}
              allowDecimal={false}
            />
            <FormItemNumberInput
              control={form.control}
              name="retry_timeout"
              label={t('form.upstream.retryTimeout')}
              suffix="s"
              allowDecimal={false}
            />
          </FormSection>
          <FormSection legend={t('form.upstream.timeout.title')}>
            <FormItemNumberInput
              control={form.control}
              name="timeout.connect"
              label={t('form.upstream.timeout.connect')}
              suffix="s"
            />
            <FormItemNumberInput
              control={form.control}
              name="timeout.send"
              label={t('form.upstream.timeout.send')}
              suffix="s"
            />
            <FormItemNumberInput
              control={form.control}
              name="timeout.read"
              label={t('form.upstream.timeout.read')}
              suffix="s"
            />
          </FormSection>
          <FormSection legend={t('form.upstream.keepalivePool.title')}>
            <FormItemNumberInput
              control={form.control}
              name="keepalive_pool.size"
              label={t('form.upstream.keepalivePool.size')}
            />
            <FormItemNumberInput
              control={form.control}
              name="keepalive_pool.idle_timeout"
              label={t('form.upstream.keepalivePool.idleTimeout')}
              suffix="s"
            />
            <FormItemNumberInput
              control={form.control}
              name="keepalive_pool.requests"
              label={t('form.upstream.keepalivePool.requests')}
              allowDecimal={false}
            />
          </FormSection>
        </FormSection>
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('upstreams.add.title')} />
      <FormSectionTOCBox>
        <UpstreamAddForm />
      </FormSectionTOCBox>
    </>
  );
}

export const Route = createFileRoute('/upstreams/add')({
  component: RouteComponent,
});
