import { t } from 'i18next';
import { FormItemPlugins } from './FormItemPlugins';
import { FormSection } from './FormSection';
import { FormSectionInfo } from './FormSectionInfo';

export const FormPartGlobalRules = () => {
  return (
    <>
      <FormSectionInfo showDate={false} />
      <FormSection legend={t('form.plugins.label')}>
        <FormItemPlugins name="plugins" label="" />
      </FormSection>
    </>
  );
};
