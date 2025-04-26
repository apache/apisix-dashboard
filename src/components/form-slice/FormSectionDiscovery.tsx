import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';
import { useFormContext } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';
import { FormItemTextInput } from '../form/TextInput';

export const FormSectionDiscovery = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<A6Type['UpstreamDiscovery']>();
  return (
    <FormSection legend={t('form.upstream.serviceDiscovery.title')}>
      <FormItemTextInput
        name="service_name"
        label={t('form.upstream.serviceName.title')}
        control={control}
      />
      <FormItemTextInput
        name="discovery_type"
        label={t('form.upstream.discoveryType.title')}
        control={control}
      />
      {/* <FormItemTextarea
        name="discovery_args"
        label={t('form.upstream.discoveryArgs.title')}
        control={control}
      /> */}
    </FormSection>
  );
};
