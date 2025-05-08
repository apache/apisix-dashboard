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
