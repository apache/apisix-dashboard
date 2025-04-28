import { t } from 'i18next';
import { FormItemPlugins } from './FormItemPlugins';
import { FormSection } from './FormSection';
import { FormSectionInfo } from './FormSectionInfo';
import type { NeedPluginSchema } from '@/apis/plugins';

export const FormPartPlugins = (props: NeedPluginSchema) => {
  return (
    <>
      <FormSectionInfo showDate={false} />
      <FormSection legend={t('form.plugins.label')}>
        <FormItemPlugins name="plugins" {...props} />
      </FormSection>
    </>
  );
};
