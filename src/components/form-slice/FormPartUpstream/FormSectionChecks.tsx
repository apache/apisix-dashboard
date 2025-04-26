import { useTranslation } from 'react-i18next';
import { FormSection } from '../FormSection';
import { FormItemSelect } from '@/components/form/Select';
import { useFormContext, useWatch } from 'react-hook-form';
import { A6 } from '@/types/schema/apisix';
import { FormItemSwitch } from '@/components/form/Switch';
import type { FormPartUpstreamType } from './schema';
import { Text } from '@mantine/core';

const FormSectionChecksActive = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  return (
    <FormSection legend={t('form.upstream.checks.active.title')}>
      <FormItemSelect
        control={control}
        name="checks.active.type"
        defaultValue={A6.UpstreamHealthCheckActiveType.options[0].value}
        label={t('form.upstream.checks.active.type')}
        data={A6.UpstreamHealthCheckActiveType.options.map((v) => v.value)}
      />
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
    </FormSection>
  );
};

export const FormSectionChecks = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const [checksEnabled] = useWatch({ name: ['__checksEnabled'], control });
  return (
    <FormSection
      legend={t('form.upstream.checks.title')}
      extra={
        <FormItemSwitch name="__checksEnabled" control={control} size="xs" />
      }
    >
      {checksEnabled && (
        <>
          <FormSectionChecksActive />
          <FormSectionChecksPassive />
        </>
      )}
      {!checksEnabled && (
        <Text c="gray.6" size="sm">
          {t('form.disabled')}
        </Text>
      )}
    </FormSection>
  );
};
