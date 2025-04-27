import { useTranslation } from 'react-i18next';
import { FormItemLabels } from '../form/Labels';
import { FormSection, type FormSectionProps } from './FormSection';
import { FormItemTextInput } from '../form/TextInput';
import { FormItemTextarea } from '../form/Textarea';
import { useFormContext } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';

export type FormPartBasicProps = Omit<FormSectionProps, 'form'> & {
  showId?: boolean;
};

export const FormPartBasic = (props: FormPartBasicProps) => {
  const { showId, ...restProps } = props;
  const { control } = useFormContext<A6Type['Basic'] & { id?: string }>();
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.basic.title')} {...restProps}>
      {showId && (
        <FormItemTextInput
          name="id"
          label="ID"
          control={control}
          readOnly
          disabled
        />
      )}
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
