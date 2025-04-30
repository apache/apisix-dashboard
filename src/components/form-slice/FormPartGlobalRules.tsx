import { t } from 'i18next';
import { FormItemPlugins } from './FormItemPlugins';
import { FormSection } from './FormSection';
import { FormSectionGeneral } from './FormSectionGeneral';

export const FormPartGlobalRules = () => {
  return (
    <>
      <FormSectionGeneral showDate={false} />
      <FormSection legend={t('form.plugins.label')}>
        <FormItemPlugins name="plugins" />
      </FormSection>
    </>
  );
};
