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
import { Text } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemLabels } from '@/components/form/Labels';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextInput } from '@/components/form/TextInput';
import { APISIX } from '@/types/schema/apisix';
import { useNamePrefix } from '@/utils/useNamePrefix';

import { FormSection } from '../FormSection';
import type { FormPartUpstreamType } from './schema';

const FormSectionChecksActive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.checks.active.title')}>
      <FormItemSwitch
        control={control}
        name={np('checks.active.https_verify_certificate')}
        label={t('form.upstream.checks.active.https_verify_certificate')}
      />
      <FormItemSelect
        control={control}
        name={np('checks.active.type')}
        defaultValue={APISIX.UpstreamHealthCheckActiveType.options[0].value}
        label={t('form.upstream.checks.active.type')}
        data={APISIX.UpstreamHealthCheckActiveType.options.map((v) => v.value)}
      />
      <FormItemNumberInput
        control={control}
        name={np('checks.active.timeout')}
        label={t('form.upstream.checks.active.timeout')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name={np('checks.active.concurrency')}
        label={t('form.upstream.checks.active.concurrency')}
        allowDecimal={false}
      />
      <FormItemTextInput
        control={control}
        name={np('checks.active.host')}
        label={t('form.upstream.checks.active.host')}
      />
      <FormItemNumberInput
        control={control}
        name={np('checks.active.port')}
        label={t('form.upstream.checks.active.port')}
        allowDecimal={false}
      />
      <FormItemTextInput
        control={control}
        name={np('checks.active.http_path')}
        label={t('form.upstream.checks.active.http_path')}
      />
      <FormItemLabels
        control={control}
        name={np('checks.active.http_request_headers')}
        label={t('form.upstream.checks.active.http_request_headers')}
      />
      <FormSection legend={t('form.upstream.checks.active.healthy.title')}>
        <FormItemNumberInput
          control={control}
          name={np('checks.active.healthy.interval')}
          label={t('form.upstream.checks.active.healthy.interval')}
          suffix="s"
        />
        <FormItemNumberInput
          control={control}
          name={np('checks.active.healthy.successes')}
          label={t('form.upstream.checks.active.healthy.successes')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name={np('checks.active.healthy.http_statuses')}
          label={t('form.upstream.checks.active.healthy.http_statuses')}
          from={String}
          to={Number}
        />
      </FormSection>
      <FormSection legend={t('form.upstream.checks.active.unhealthy.title')}>
        <FormItemNumberInput
          control={control}
          name={np('checks.active.unhealthy.interval')}
          label={t('form.upstream.checks.active.unhealthy.interval')}
          suffix="s"
        />
        <FormItemNumberInput
          control={control}
          name={np('checks.active.unhealthy.http_failures')}
          label={t('form.upstream.checks.active.unhealthy.http_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name={np('checks.active.unhealthy.tcp_failures')}
          label={t('form.upstream.checks.active.unhealthy.tcp_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name={np('checks.active.unhealthy.timeouts')}
          label={t('form.upstream.checks.active.unhealthy.timeouts')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name={np('checks.active.unhealthy.http_statuses')}
          label={t('form.upstream.checks.active.unhealthy.http_statuses')}
          from={String}
          to={Number}
        />
      </FormSection>
    </FormSection>
  );
};

const FormItemChecksPassiveEnabled = () => {
  const { control } = useFormContext<FormPartUpstreamType>();
  return <FormItemSwitch control={control} name="__checksPassiveEnabled" />;
};
const FormSectionChecksPassiveCore = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  const passiveEnabled = useWatch({
    control,
    name: '__checksPassiveEnabled',
    defaultValue: false,
  });
  if (passiveEnabled) {
    return (
      <>
        <FormItemSelect
          control={control}
          name={np('checks.passive.type')}
          defaultValue={APISIX.UpstreamHealthCheckPassiveType.options[0].value}
          label={t('form.upstream.checks.passive.type')}
          data={APISIX.UpstreamHealthCheckPassiveType.options.map(
            (v) => v.value
          )}
        />

        <FormSection legend={t('form.upstream.checks.passive.healthy.title')}>
          <FormItemNumberInput
            control={control}
            name={np('checks.passive.healthy.successes')}
            label={t('form.upstream.checks.passive.healthy.successes')}
            allowDecimal={false}
          />
          <FormItemTagsInput
            control={control}
            name={np('checks.passive.healthy.http_statuses')}
            label={t('form.upstream.checks.passive.healthy.http_statuses')}
            from={String}
            to={Number}
          />
        </FormSection>

        <FormSection legend={t('form.upstream.checks.passive.unhealthy.title')}>
          <FormItemNumberInput
            control={control}
            name={np('checks.passive.unhealthy.http_failures')}
            label={t('form.upstream.checks.passive.unhealthy.http_failures')}
            allowDecimal={false}
          />
          <FormItemNumberInput
            control={control}
            name={np('checks.passive.unhealthy.tcp_failures')}
            label={t('form.upstream.checks.passive.unhealthy.tcp_failures')}
            allowDecimal={false}
          />
          <FormItemNumberInput
            control={control}
            name={np('checks.passive.unhealthy.timeouts')}
            label={t('form.upstream.checks.passive.unhealthy.timeouts')}
            allowDecimal={false}
          />
          <FormItemTagsInput
            control={control}
            name={np('checks.passive.unhealthy.http_statuses')}
            label={t('form.upstream.checks.passive.unhealthy.http_statuses')}
            from={String}
            to={Number}
          />
        </FormSection>
      </>
    );
  }
  return (
    <Text c="gray.6" size="sm">
      {t('form.disabled')}
    </Text>
  );
};

const FormSectionChecksPassive = () => {
  const { t } = useTranslation();
  return (
    <FormSection
      legend={t('form.upstream.checks.passive.title')}
      extra={<FormItemChecksPassiveEnabled />}
    >
      <FormSectionChecksPassiveCore />
    </FormSection>
  );
};

const FormItemChecksEnabled = () => {
  const { control } = useFormContext<FormPartUpstreamType>();
  return <FormItemSwitch control={control} name="__checksEnabled" />;
};

const FormSectionChecksCore = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const enabled = useWatch({ control, name: '__checksEnabled' });

  if (enabled) {
    return (
      <>
        <FormSectionChecksActive />
        <FormSectionChecksPassive />
      </>
    );
  }
  return (
    <Text c="gray.6" size="sm">
      {t('form.disabled')}
    </Text>
  );
};

export const FormSectionChecks = () => {
  const { t } = useTranslation();
  return (
    <FormSection
      legend={t('form.upstream.checks.title')}
      extra={<FormItemChecksEnabled />}
    >
      <FormSectionChecksCore />
    </FormSection>
  );
};
