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
import { Divider, InputWrapper, Text } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemEditor } from '@/components/form/Editor';
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
    <FormPartBasic showStatus namePlaceholder="my-route-name">
      <FormItemNumberInput
        control={control}
        name="priority"
        label={t('form.routes.priority')}
        description={t('form.routes.priorityDesc')}
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
      <Text size="sm" c="dimmed" mb="md">
        {t('form.routes.matchRulesDesc')}
      </Text>
      <FormItemTagsInput
        control={control}
        name="methods"
        label={t('form.routes.methods')}
        description={t('form.routes.methodsDesc')}
        data={APISIX.HttpMethod.options.map((v) => v.value)}
        searchValue=""
      />
      <InputWrapper
        label={t('form.routes.enableWebsocket')}
        description={t('form.routes.enableWebsocketDesc')}
      >
        <FormItemSwitch control={control} name="enable_websocket" />
      </InputWrapper>
      <FormItemTextInput
        control={control}
        name="uri"
        label={t('form.routes.uri')}
        description={t('form.routes.uriDesc')}
        placeholder={t('form.routes.uriPlaceholder')}
        withAsterisk
      />
      <FormItemTagsInput
        control={control}
        name="uris"
        label={t('form.routes.uris')}
        description={t('form.routes.urisDesc')}
      />
      <FormItemTextInput
        control={control}
        name="host"
        label={t('form.routes.host')}
        description={t('form.routes.hostDesc')}
        placeholder={t('form.routes.hostPlaceholder')}
      />
      <FormItemTagsInput
        control={control}
        name="hosts"
        label={t('form.routes.hosts')}
        description={t('form.routes.hostsDesc')}
      />
      <FormItemTextInput
        control={control}
        name="remote_addr"
        label={t('form.routes.remoteAddr')}
        description={t('form.routes.remoteAddrDesc')}
        placeholder={t('form.routes.remoteAddrPlaceholder')}
      />
      <FormItemTagsInput
        control={control}
        name="remote_addrs"
        label={t('form.routes.remoteAddrs')}
        description={t('form.routes.remoteAddrsDesc')}
      />
      <FormItemEditor
        control={control}
        name="vars"
        label={t('form.routes.vars')}
        description={t('form.routes.varsDesc')}
      />
      <FormItemTextarea
        control={control}
        name="filter_func"
        label={t('form.routes.filterFunc')}
        description={t('form.routes.filterFuncDesc')}
        placeholder={t('form.routes.filterFuncPlaceholder')}
      />
    </FormSection>
  );
};

export const FormSectionUpstream = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.upstreams.title')} withAsterisk>
      <Text size="sm" c="dimmed" mb="md">
        {t('form.upstreams.requiredDesc')}
      </Text>
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
      <Text size="sm" c="dimmed" mb="md">
        {t('form.routes.serviceDesc')}
      </Text>
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
