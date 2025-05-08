/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { InputWrapper, Text } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSelect } from '@/components/form/Select';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { APISIX } from '@/types/schema/apisix';

import { FormPartBasic } from '../FormPartBasic';
import { FormSection } from '../FormSection';
import { FormItemCertKeyList } from './FormItemCertKeyList';
import type { SSLPostType } from './schema';

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
