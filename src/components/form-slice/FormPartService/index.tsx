import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { FormSection } from '../FormSection';
import { FormPartBasic } from '../FormPartBasic';
import { FormItemPlugins } from '../FormItemPlugins';
import { FormItemTextInput } from '@/components/form/TextInput';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { Divider, InputWrapper } from '@mantine/core';
import { NamePrefixProvider } from '@/utils/useNamePrefix';
import { FormPartUpstream } from '../FormPartUpstream';
import type { ServicePostType } from './schema';

const FormSectionUpstream = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<ServicePostType>();
  return (
    <FormSection legend={t('form.upstream.title')}>
      <FormSection legend={t('form.upstream.upstreamId')}>
        <FormItemTextInput control={control} name="upstream_id" />
      </FormSection>
      <Divider my="xs" label={t('or')} />
      <NamePrefixProvider value="upstream">
        <FormPartUpstream />
      </NamePrefixProvider>
    </FormSection>
  );
};

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
