import { useTranslation } from 'react-i18next';
import { FormSection } from '../FormSection';
import { useFormContext } from 'react-hook-form';
import { FormItemTextInput } from '../../form/TextInput';
import type { FormPartUpstreamType } from './schema';
import { FormItemJsonInput } from '@/components/form/JsonInput';
import { useNamePrefix } from '@/utils/useNamePrefix';

export const FormSectionDiscovery = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.serviceDiscovery.title')}>
      <FormItemTextInput
        name={np('service_name')}
        label={t('form.upstream.serviceName.title')}
        control={control}
      />
      <FormItemTextInput
        name={np('discovery_type')}
        label={t('form.upstream.discoveryType.title')}
        control={control}
      />
      <FormItemJsonInput
        name={np('discovery_args')}
        label={t('form.upstream.discoveryArgs.title')}
        control={control}
        resize="vertical"
        toObject
      />
    </FormSection>
  );
};
