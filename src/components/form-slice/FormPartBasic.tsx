import { useTranslation } from 'react-i18next';
import { FormItemLabels } from '../form/Labels';
import { FormSection, type FormSectionProps } from './FormSection';
import { FormItemTextInput } from '../form/TextInput';
import { FormItemTextarea } from '../form/Textarea';
import { useFormContext } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';
import { useNamePrefix } from '@/utils/useNamePrefix';
import type { PropsWithChildren } from 'react';

export type FormPartBasicProps = Omit<FormSectionProps, 'form'> &
  PropsWithChildren;

export const FormPartBasic = (props: FormPartBasicProps) => {
  const { children, ...restProps } = props;
  const { control } = useFormContext<A6Type['Basic']>();
  const { t } = useTranslation();
  const np = useNamePrefix();

  return (
    <FormSection legend={t('form.basic.title')} {...restProps}>
      <FormItemTextInput
        name={np('name')}
        label={t('form.basic.name')}
        control={control}
      />
      <FormItemTextarea
        name={np('desc')}
        label={t('form.basic.desc')}
        control={control}
      />
      <FormItemLabels name={np('labels')} control={control} />
      {children}
    </FormSection>
  );
};
