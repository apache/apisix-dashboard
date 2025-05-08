/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Divider } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { APISIX } from '@/types/schema/apisix';
import { useNamePrefix } from '@/utils/useNamePrefix';

import { FormPartBasic } from '../FormPartBasic';
import { FormSection } from '../FormSection';
import { FormItemNodes } from './FormItemNodes';
import { FormSectionChecks } from './FormSectionChecks';
import { FormSectionDiscovery } from './FormSectionDiscovery';
import type { FormPartUpstreamType } from './schema';

export const FormSectionTLS = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();

  return (
    <FormSection legend={t('form.upstream.tls.title')}>
      <FormItemSwitch
        control={control}
        name={np('tls.verify')}
        label={t('form.upstream.tls.verify')}
      />
      <FormSection legend={t('form.upstream.tls.clientCert')}>
        <FormItemTextarea
          control={control}
          name={np('tls.client_cert')}
          label={t('form.upstream.tls.clientCert')}
        />
        <FormItemTextarea
          control={control}
          name={np('tls.client_key')}
          label={t('form.upstream.tls.clientKey')}
        />
        <Divider my="xs" label={t('or')} />
        <FormItemTextInput
          control={control}
          name={np('tls.client_cert_id')}
          label={t('form.upstream.tls.clientCertId')}
        />
      </FormSection>
    </FormSection>
  );
};

export const FormItemScheme = () => {
  const { control } = useFormContext<FormPartUpstreamType>();
  const { t } = useTranslation();
  const np = useNamePrefix();
  return (
    <FormItemSelect
      control={control}
      name={np('scheme')}
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
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.loadBalancing')}>
      <FormItemSelect
        control={control}
        name={np('type')}
        label={t('form.upstream.type')}
        defaultValue={APISIX.UpstreamBalancer.options[0].value}
        data={APISIX.UpstreamBalancer.options.map((v) => v.value)}
      />
      <FormItemSelect
        control={control}
        name={np('hash_on')}
        label={t('form.upstream.hashOn')}
        defaultValue={APISIX.UpstreamHashOn.options[0].value}
        data={APISIX.UpstreamHashOn.options.map((v) => v.value)}
        description={t('form.upstream.hashOnDesc')}
      />
      <FormItemTextInput
        control={control}
        name={np('key')}
        label={t('form.upstream.key')}
        description={t('form.upstream.keyDesc')}
      />
    </FormSection>
  );
};

export const FormSectionPassHost = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.passHost')}>
      <FormItemSelect
        control={control}
        name={np('pass_host')}
        label={t('form.upstream.passHost')}
        defaultValue={APISIX.UpstreamPassHost.options[0].value}
        data={APISIX.UpstreamPassHost.options.map((v) => v.value)}
      />
      <FormItemTextInput
        control={control}
        name={np('upstream_host')}
        label={t('form.upstream.upstreamHost')}
        description={t('form.upstream.upstreamHostDesc')}
      />
    </FormSection>
  );
};

export const FormSectionRetry = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.retry')}>
      <FormItemNumberInput
        control={control}
        name={np('retries')}
        label={t('form.upstream.retries')}
        allowDecimal={false}
      />
      <FormItemNumberInput
        control={control}
        name={np('retry_timeout')}
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
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.timeout.title')}>
      <FormItemNumberInput
        control={control}
        name={np('timeout.connect')}
        label={t('form.upstream.timeout.connect')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name={np('timeout.send')}
        label={t('form.upstream.timeout.send')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name={np('timeout.read')}
        label={t('form.upstream.timeout.read')}
        suffix="s"
      />
    </FormSection>
  );
};

export const FormSectionKeepAlive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.keepalivePool.title')}>
      <FormItemNumberInput
        control={control}
        name={np('keepalive_pool.size')}
        label={t('form.upstream.keepalivePool.size')}
      />
      <FormItemNumberInput
        control={control}
        name={np('keepalive_pool.idle_timeout')}
        label={t('form.upstream.keepalivePool.idleTimeout')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name={np('keepalive_pool.requests')}
        label={t('form.upstream.keepalivePool.requests')}
        allowDecimal={false}
      />
    </FormSection>
  );
};

export const FormPartUpstream = () => {
  const { t } = useTranslation();
  const np = useNamePrefix();
  return (
    <>
      <FormPartBasic />
      <FormSection legend={t('form.upstream.findUpstreamFrom')}>
        <FormSection legend={t('form.upstream.nodes.title')}>
          <FormItemNodes name={np('nodes')} required />
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
