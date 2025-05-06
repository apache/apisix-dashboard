import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormItemTextInput } from '@/components/form/TextInput';
import { FormPartBasic } from './FormPartBasic';
import { FormSection } from './FormSection';
import { FormItemPlugins } from './FormItemPlugins';
import type { APISIXType } from '@/types/schema/apisix';

const FormSectionPlugins = () => {
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.plugins.label')}>
      <FormItemPlugins name="plugins" />
    </FormSection>
  );
};

export const FormPartConsumer = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['ConsumerPut']>();

  return (
    <>
      <FormPartBasic
        showName={false}
        before={
          <FormItemTextInput
            control={control}
            name="username"
            label={t('consumers.username')}
            required
          />
        }
      />
      <FormItemTextInput
        control={control}
        name="group_id"
        label={t('form.consumer.groupId')}
      />
      <FormSectionPlugins />
    </>
  );
};
