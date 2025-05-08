import { InputWrapper } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextInput } from '@/components/form/TextInput';

import { FormItemPlugins } from '../FormItemPlugins';
import { FormPartBasic } from '../FormPartBasic';
import { FormSectionUpstream } from '../FormPartRoute';
import { FormSection } from '../FormSection';
import type { ServicePostType } from './schema';


const FormSectionPlugins = () => {
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.plugins.label')}>
      <FormItemPlugins name="plugins" />
    </FormSection>
  );
};

const FormSectionSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<ServicePostType>();
  return (
    <FormSection legend={t('form.services.settings')}>
      <InputWrapper label={t('form.services.enableWebsocket')}>
        <FormItemSwitch control={control} name="enable_websocket" />
      </InputWrapper>
      <FormItemTextInput
        control={control}
        name="script"
        label={t('form.services.script')}
      />
      <FormItemTagsInput
        control={control}
        name="hosts"
        label={t('form.services.hosts')}
      />
    </FormSection>
  );
};

export const FormPartService = () => {
  return (
    <>
      <FormPartBasic />
      <FormSectionSettings />
      <FormSectionUpstream />
      <FormSectionPlugins />
    </>
  );
};
