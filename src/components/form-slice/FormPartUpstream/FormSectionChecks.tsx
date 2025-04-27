import { useTranslation } from 'react-i18next';
import { FormSection } from '../FormSection';
import { FormItemSelect } from '@/components/form/Select';
import { useFormContext, useWatch } from 'react-hook-form';
import { A6 } from '@/types/schema/apisix';
import { FormItemSwitch } from '@/components/form/Switch';
import type { FormPartUpstreamType } from './schema';
import { Text } from '@mantine/core';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemTextInput } from '@/components/form/TextInput';
import { FormItemLabels } from '@/components/form/Labels';
import { FormItemTagsInput } from '@/components/form/TagInput';

const FormSectionChecksActive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.checks.active.title')}>
      <FormItemSwitch
        control={control}
        name="checks.active.https_verify_certificate"
        label={t('form.upstream.checks.active.https_verify_certificate')}
      />
      <FormItemSelect
        control={control}
        name="checks.active.type"
        defaultValue={A6.UpstreamHealthCheckActiveType.options[0].value}
        label={t('form.upstream.checks.active.type')}
        data={A6.UpstreamHealthCheckActiveType.options.map((v) => v.value)}
      />
      <FormItemNumberInput
        control={control}
        name="checks.active.timeout"
        label={t('form.upstream.checks.active.timeout')}
        suffix="s"
      />
      <FormItemNumberInput
        control={control}
        name="checks.active.concurrency"
        label={t('form.upstream.checks.active.concurrency')}
        allowDecimal={false}
      />
      <FormItemTextInput
        control={control}
        name="checks.active.host"
        label={t('form.upstream.checks.active.host')}
      />
      <FormItemNumberInput
        control={control}
        name="checks.active.port"
        label={t('form.upstream.checks.active.port')}
        allowDecimal={false}
      />
      <FormItemTextInput
        control={control}
        name="checks.active.http_path"
        label={t('form.upstream.checks.active.http_path')}
      />
      <FormItemLabels
        control={control}
        name="checks.active.http_request_headers"
        label={t('form.upstream.checks.active.http_request_headers')}
      />
      <FormSection legend={t('form.upstream.checks.active.healthy.title')}>
        <FormItemNumberInput
          control={control}
          name="checks.active.healthy.interval"
          label={t('form.upstream.checks.active.healthy.interval')}
          suffix="s"
        />
        <FormItemNumberInput
          control={control}
          name="checks.active.healthy.successes"
          label={t('form.upstream.checks.active.healthy.successes')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name="checks.active.healthy.http_statuses"
          label={t('form.upstream.checks.active.healthy.http_statuses')}
        />
      </FormSection>
      <FormSection legend={t('form.upstream.checks.active.unhealthy.title')}>
        <FormItemNumberInput
          control={control}
          name="checks.active.unhealthy.interval"
          label={t('form.upstream.checks.active.unhealthy.interval')}
          suffix="s"
        />
        <FormItemNumberInput
          control={control}
          name="checks.active.unhealthy.http_failures"
          label={t('form.upstream.checks.active.unhealthy.http_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name="checks.active.unhealthy.tcp_failures"
          label={t('form.upstream.checks.active.unhealthy.tcp_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name="checks.active.unhealthy.timeouts"
          label={t('form.upstream.checks.active.unhealthy.timeouts')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name="checks.active.unhealthy.http_statuses"
          label={t('form.upstream.checks.active.unhealthy.http_statuses')}
        />
      </FormSection>
    </FormSection>
  );
};

const FormSectionChecksPassive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.checks.passive.title')}>
      <FormItemSelect
        control={control}
        name="checks.passive.type"
        defaultValue={A6.UpstreamHealthCheckPassiveType.options[0].value}
        label={t('form.upstream.checks.passive.type')}
        data={A6.UpstreamHealthCheckPassiveType.options.map((v) => v.value)}
      />

      <FormSection legend={t('form.upstream.checks.passive.healthy.title')}>
        <FormItemNumberInput
          control={control}
          name="checks.passive.healthy.successes"
          label={t('form.upstream.checks.passive.healthy.successes')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name="checks.passive.healthy.http_statuses"
          label={t('form.upstream.checks.passive.healthy.http_statuses')}
        />
      </FormSection>

      <FormSection legend={t('form.upstream.checks.passive.unhealthy.title')}>
        <FormItemNumberInput
          control={control}
          name="checks.passive.unhealthy.http_failures"
          label={t('form.upstream.checks.passive.unhealthy.http_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name="checks.passive.unhealthy.tcp_failures"
          label={t('form.upstream.checks.passive.unhealthy.tcp_failures')}
          allowDecimal={false}
        />
        <FormItemNumberInput
          control={control}
          name="checks.passive.unhealthy.timeouts"
          label={t('form.upstream.checks.passive.unhealthy.timeouts')}
          allowDecimal={false}
        />
        <FormItemTagsInput
          control={control}
          name="checks.passive.unhealthy.http_statuses"
          label={t('form.upstream.checks.passive.unhealthy.http_statuses')}
        />
      </FormSection>
    </FormSection>
  );
};

const FormItemChecksEnabled = () => {
  const { control } = useFormContext<FormPartUpstreamType>();
  return <FormItemSwitch control={control} name="__checksEnabled" />;
};

const FormSectionChecksCore = () => {
  const { t } = useTranslation();
  const enabled = useWatch({
    name: '__checksEnabled',
    exact: true,
  });
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
