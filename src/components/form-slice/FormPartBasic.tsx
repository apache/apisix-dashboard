import { useTranslation } from 'react-i18next';
import { FormItemLabels } from '../form/Labels';
import { FormSection, type FormSectionProps } from './FormSection';
import { FormItemTextInput } from '../form/TextInput';
import { FormItemTextarea } from '../form/Textarea';
import { useFormContext } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';

export const FormPartBasic = (props: Omit<FormSectionProps, 'form'>) => {
  const { control } = useFormContext<A6Type['Basic']>();
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.basic.title')} {...props}>
      <FormItemTextInput
        name="name"
        label={t('form.basic.name')}
        control={control}
      />
      <FormItemTextarea
        name="desc"
        label={t('form.basic.desc')}
        control={control}
      />
      <FormItemLabels name="labels" control={control} />
    </FormSection>
  );
};
