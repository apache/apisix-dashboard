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
import { Divider, InputWrapper } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { APISIX } from '@/types/schema/apisix';
import { NamePrefixProvider } from '@/utils/useNamePrefix';
import { zGetDefault } from '@/utils/zod';

import { useFormReadOnlyFields } from '../../../utils/form-context';
import { FormItemPlugins } from '../FormItemPlugins';
import { FormPartBasic } from '../FormPartBasic';
import { FormPartUpstream, FormSectionTimeout } from '../FormPartUpstream';
import { FormSection } from '../FormSection';
import type { RoutePostType } from './schema';

const FormPartBasicWithPriority = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormPartBasic showStatus>
      <FormItemNumberInput
        control={control}
        name="priority"
        label={t('form.routes.priority')}
        defaultValue={zGetDefault(APISIX.Route).priority!}
      />
    </FormPartBasic>
  );
};

const FormSectionMatchRules = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.routes.matchRules')}>
      <FormItemTagsInput
        control={control}
        name="methods"
        label={t('form.routes.methods')}
        data={APISIX.HttpMethod.options.map((v) => v.value)}
        searchValue=""
      />
      <InputWrapper label={t('form.routes.enableWebsocket')}>
        <FormItemSwitch control={control} name="enable_websocket" />
      </InputWrapper>
      <FormItemTextInput
        control={control}
        name="uri"
        label={t('form.routes.uri')}
      />
      <FormItemTagsInput
        control={control}
        name="uris"
        label={t('form.routes.uris')}
      />
      <FormItemTextInput
        control={control}
        name="host"
        label={t('form.routes.host')}
      />
      <FormItemTagsInput
        control={control}
        name="hosts"
        label={t('form.routes.hosts')}
      />
      <FormItemTextInput
        control={control}
        name="remote_addr"
        label={t('form.routes.remoteAddr')}
      />
      <FormItemTagsInput
        control={control}
        name="remote_addrs"
        label={t('form.routes.remoteAddrs')}
      />
      <FormItemTagsInput
        control={control}
        name="vars"
        label={t('form.routes.vars')}
      />
      <FormItemTextarea
        control={control}
        name="filter_func"
        label={t('form.routes.filterFunc')}
      />
    </FormSection>
  );
};

export const FormSectionUpstream = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.upstreams.title')}>
      <FormSection legend={t('form.upstreams.upstreamId')}>
        <FormItemTextInput control={control} name="upstream_id" />
      </FormSection>
      <Divider my="xs" label={t('or')} />
      <NamePrefixProvider value="upstream">
        <FormPartUpstream />
      </NamePrefixProvider>
    </FormSection>
  );
};

export const FormSectionPlugins = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.plugins.label')}>
      <FormItemTextInput
        control={control}
        name="plugin_config_id"
        label={t('form.plugins.configId')}
      />
      <Divider my="xs" label={t('or')} />
      <FormItemPlugins name="plugins" />
    </FormSection>
  );
};

export const FormSectionService = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  const readOnlyFields = useFormReadOnlyFields();
  return (
    <FormSection
      legend={t('form.routes.service')}
      disabled={readOnlyFields.includes('service_id')}
    >
      <FormItemTextInput
        control={control}
        name="service_id"
        label={t('form.upstreams.serviceId')}
      />
    </FormSection>
  );
};

export const FormPartRoute = () => {
  return (
    <>
      <FormPartBasicWithPriority />
      <FormSectionMatchRules />
      <FormSectionService />
      <FormSectionTimeout />
      <FormSectionUpstream />
      <FormSectionPlugins />
    </>
  );
};
