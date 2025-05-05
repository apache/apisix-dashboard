import { useTranslation } from 'react-i18next';
import { FormItemLabels } from '../form/Labels';
import { FormSection, type FormSectionProps } from './FormSection';
import { FormItemTextInput } from '../form/TextInput';
import { FormItemTextarea } from '../form/Textarea';
import { useFormContext } from 'react-hook-form';
import type { APISIXType } from '@/types/schema/apisix';
import { useNamePrefix } from '@/utils/useNamePrefix';
import type { PropsWithChildren } from 'react';

export type FormPartBasicProps = Omit<FormSectionProps, 'form'> &
  PropsWithChildren & {
    showName?: boolean;
    showDesc?: boolean;
    showLabels?: boolean;
  };

export const FormPartBasic = (props: FormPartBasicProps) => {
  const {
    children,
    showName = true,
    showDesc = true,
    showLabels = true,
    ...restProps
  } = props;
  const { control } = useFormContext<APISIXType['Basic']>();
  const { t } = useTranslation();
  const np = useNamePrefix();

  return (
    <FormSection legend={t('form.basic.title')} {...restProps}>
      {showName && (
        <FormItemTextInput
          name={np('name')}
          label={t('form.basic.name')}
          control={control}
        />
      )}
      {showDesc && (
        <FormItemTextarea
          name={np('desc')}
          label={t('form.basic.desc')}
          control={control}
        />
      )}
      {showLabels && <FormItemLabels name={np('labels')} control={control} />}
      {children}
    </FormSection>
  );
};
