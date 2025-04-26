import { useTranslation } from 'react-i18next';
import { FormSection } from '../FormSection';
import { FormItemSelect } from '@/components/form/Select';
import { useFormContext } from 'react-hook-form';
import { A6, type A6Type } from '@/types/schema/apisix';
import { Button } from '@mantine/core';

export const FormSectionChecks = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<Pick<A6Type['Upstream'], 'checks'>>();
  return (
    <FormSection
      legend={t('form.upstream.checks.title')}
      extra={<Button>disabled</Button>}
    >
      <FormSection legend={t('form.upstream.checks.active.title')}>
        <FormItemSelect
          control={control}
          name="checks.active.type"
          defaultValue={A6.UpstreamHealthCheckActiveType.options[0].value}
          label={t('form.upstream.checks.active.type')}
          data={A6.UpstreamHealthCheckActiveType.options.map((v) => v.value)}
        />
      </FormSection>
      <FormSection legend={t('form.upstream.checks.passive.title')}>
        <FormItemSelect
          control={control}
          name="checks.passive.type"
          defaultValue={A6.UpstreamHealthCheckPassiveType.options[0].value}
          label={t('form.upstream.checks.passive.type')}
          data={A6.UpstreamHealthCheckPassiveType.options.map((v) => v.value)}
        />
      </FormSection>
    </FormSection>
  );
};
