import { APISIX } from '@/types/schema/apisix';
import { FormSection } from '../FormSection';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { SSLPostType } from './schema';
import { InputWrapper, Text } from '@mantine/core';
import { FormPartBasic } from '../FormPartBasic';
import { FormItemCertKeyList } from './FormItemCertKeyList';

const FormSectionClient = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SSLPostType>();
  const clientEnabled = useWatch({ control, name: '__clientEnabled' });
  return (
    <FormSection
      legend={t('form.ssls.client.title')}
      extra={<FormItemSwitch control={control} name="__clientEnabled" />}
    >
      {clientEnabled ? (
        <>
          <FormItemTextarea
            control={control}
            label={t('form.ssls.client.ca')}
            name="client.ca"
          />
          <FormItemNumberInput
            control={control}
            label={t('form.ssls.client.depth')}
            name="client.depth"
            defaultValue={1}
            min={0}
          />
          <InputWrapper label={t('form.ssls.client.skipMtlsUriRegex')}>
            <FormItemSwitch
              control={control}
              name="client.skip_mtls_uri_regex"
            />
          </InputWrapper>
        </>
      ) : (
        <Text c="gray.6" size="sm">
          {t('form.disabled')}
        </Text>
      )}
    </FormSection>
  );
};
export const FormPartSSL = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SSLPostType>();
  return (
    <>
      <FormPartBasic showName={false} showDesc={false} showStatus />
      <FormItemSelect
        control={control}
        name="type"
        label={t('form.ssls.type')}
        data={APISIX.SSLType.options.map((v) => v.value.toString())}
        defaultValue={APISIX.SSLType.options[0].value.toString()}
      />
      <FormItemTagsInput
        control={control}
        name="ssl_protocols"
        label={t('form.ssls.ssl_protocols')}
        data={APISIX.SSLProtocols.options.map((v) => v.value.toString())}
      />
      <FormItemTextInput
        control={control}
        label={t('form.ssls.sni')}
        name="sni"
        placeholder="domain1.com"
      />
      <FormItemTagsInput
        control={control}
        label={t('form.ssls.snis')}
        name="snis"
        placeholder="domain1.com, domain2.com"
      />
      <FormItemCertKeyList />
      <FormSectionClient />
    </>
  );
};
