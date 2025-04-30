import { APISIX } from '@/types/schema/apisix';
import { useTranslation } from 'react-i18next';

import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { FormItemNodes } from './FormItemNodes';
import { FormPartBasic } from '../FormPartBasic';
import { FormSection } from '../FormSection';
import { FormSectionChecks } from './FormSectionChecks';
import { FormSectionDiscovery } from './FormSectionDiscovery';
import { Divider } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import type { FormPartUpstreamType } from './schema';
import { FormItemSwitch } from '@/components/form/Switch';

export const FormSectionTLS = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.tls.title')}>
      <FormItemSwitch
        control={control}
        name="tls.verify"
        label={t('form.upstream.tls.verify')}
      />
      <FormSection>
        <FormItemTextarea
          control={control}
          name="tls.client_cert"
          label={t('form.upstream.tls.clientCert')}
        />
        <FormItemTextarea
          control={control}
          name="tls.client_key"
          label={t('form.upstream.tls.clientKey')}
        />
        <Divider my="xs" label={t('or')} />
        <FormItemTextInput
          control={control}
          name="tls.client_cert_id"
          label={t('form.upstream.tls.clientCertId')}
        />
      </FormSection>
    </FormSection>
  );
};

export const FormItemScheme = () => {
  const { control } = useFormContext<FormPartUpstreamType>();
  const { t } = useTranslation();
  return (
    <FormItemSelect
      control={control}
      name="scheme"
      label={t('form.upstream.scheme')}
      defaultValue={APISIX.UpstreamSchemeL7.options[0].value}
      data={[
        {
          group: 'L7',
          items: APISIX.UpstreamSchemeL7.options.map((v) => v.value),
        },
        {
          group: 'L4',
          items: APISIX.UpstreamSchemeL4.options.map((v) => v.value),
        },
      ]}
    />
  );
};

export const FormSectionLoadbalancing = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.loadBalancing')}>
      <FormItemSelect
        control={control}
        name="type"
        label={t('form.upstream.type')}
        defaultValue={APISIX.UpstreamBalancer.options[0].value}
        data={APISIX.UpstreamBalancer.options.map((v) => v.value)}
      />
      <FormItemSelect
        control={control}
        name="hash_on"
        label={t('form.upstream.hashOn')}
        defaultValue={APISIX.UpstreamHashOn.options[0].value}
        data={APISIX.UpstreamHashOn.options.map((v) => v.value)}
        description={t('form.upstream.hashOnDesc')}
      />
      <FormItemTextInput
        control={control}
        name="key"
        label={t('form.upstream.key')}
        description={t('form.upstream.keyDesc')}
      />
    </FormSection>
  );
};

export const FormSectionPassHost = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.passHost')}>
      <FormItemSelect
        control={control}
        name="pass_host"
        label={t('form.upstream.passHost')}
        defaultValue={APISIX.UpstreamPassHost.options[0].value}
        data={APISIX.UpstreamPassHost.options.map((v) => v.value)}
      />
      <FormItemTextInput
        control={control}
        name="upstream_host"
        label={t('form.upstream.upstreamHost')}
        description={t('form.upstream.upstreamHostDesc')}
      />
    </FormSection>
  );
};

export const FormSectionRetry = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.retry')}>
      <FormItemNumberInput
        control={control}
        name="retries"
        label={t('form.upstream.retries')}
        allowDecimal={false}
      />
      <FormItemNumberInput
        control={control}
        name="retry_timeout"
        label={t('form.upstream.retryTimeout')}
        suffix="s"
        allowDecimal={false}
      />
    </FormSection>
  );
};

export const FormSectionTimeout = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.timeout.title')}>
      <FormItemNumberInput
        control={control}
        name="timeout.connect"
        label={t('form.upstream.timeout.connect')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name="timeout.send"
        label={t('form.upstream.timeout.send')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name="timeout.read"
        label={t('form.upstream.timeout.read')}
        suffix="s"
      />
    </FormSection>
  );
};

export const FormSectionKeepAlive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.keepalivePool.title')}>
      <FormItemNumberInput
        control={control}
        name="keepalive_pool.size"
        label={t('form.upstream.keepalivePool.size')}
      />
      <FormItemNumberInput
        control={control}
        name="keepalive_pool.idle_timeout"
        label={t('form.upstream.keepalivePool.idleTimeout')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name="keepalive_pool.requests"
        label={t('form.upstream.keepalivePool.requests')}
        allowDecimal={false}
      />
    </FormSection>
  );
};
export const FormPartUpstream = () => {
  const { t } = useTranslation();
  return (
    <>
      <FormPartBasic />
      <FormSection legend={t('form.upstream.findUpstreamFrom')}>
        <FormSection legend={t('form.upstream.nodes.title')}>
          <FormItemNodes
            name="nodes"
            label={t('form.upstream.nodes.title')}
            required
          />
        </FormSection>
        <Divider my="xs" label={t('or')} />
        <FormSectionDiscovery />
      </FormSection>
      <FormSection legend={t('form.upstream.connectionConfiguration')}>
        <FormItemScheme />
        <FormSectionLoadbalancing />
        <FormSectionPassHost />
        <FormSectionRetry />
        <FormSectionTimeout />
        <FormSectionKeepAlive />
        <FormSectionTLS />
      </FormSection>

      <FormSectionChecks />
    </>
  );
};
