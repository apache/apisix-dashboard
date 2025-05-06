import { useTranslation } from 'react-i18next';
import { FormPartBasic } from './FormPartBasic';
import {
  FormSectionGeneral,
  type FormSectionGeneralProps,
} from './FormSectionGeneral';
import { FormSection } from './FormSection';
import { FormItemPlugins } from './FormItemPlugins';

export const FormPartCredential = (props: FormSectionGeneralProps) => {
  const { t } = useTranslation();
  return (
    <>
      <FormSectionGeneral showDate={false} {...props} />
      <FormPartBasic showName={false} />
      <FormSection legend={t('form.plugins.label')}>
        <FormItemPlugins name="plugins" schema="consumer_schema" />
      </FormSection>
    </>
  );
};
