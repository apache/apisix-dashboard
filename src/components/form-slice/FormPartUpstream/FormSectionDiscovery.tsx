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
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemJsonInput } from '@/components/form/JsonInput';
import { useNamePrefix } from '@/utils/useNamePrefix';

import { FormItemTextInput } from '../../form/TextInput';
import { FormSection } from '../FormSection';
import type { FormPartUpstreamType } from './schema';

export const FormSectionDiscovery = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<FormPartUpstreamType>();
  const np = useNamePrefix();
  return (
    <FormSection legend={t('form.upstream.serviceDiscovery.title')}>
      <FormItemTextInput
        name={np('service_name')}
        label={t('form.upstream.serviceName.title')}
        control={control}
      />
      <FormItemTextInput
        name={np('discovery_type')}
        label={t('form.upstream.discoveryType.title')}
        control={control}
      />
      <FormItemJsonInput
        name={np('discovery_args')}
        label={t('form.upstream.discoveryArgs.title')}
        control={control}
        toObject
      />
    </FormSection>
  );
};
