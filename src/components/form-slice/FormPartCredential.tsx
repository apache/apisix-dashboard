import { useTranslation } from 'react-i18next';

import { FormItemPlugins } from './FormItemPlugins';
import { FormPartBasic } from './FormPartBasic';
import { FormSection } from './FormSection';
import {
  FormSectionGeneral,
  type FormSectionGeneralProps,
} from './FormSectionGeneral';

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
