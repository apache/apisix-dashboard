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
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemTextInput } from '@/components/form/TextInput';

import { FormPartBasic } from '../FormPartBasic';
import {
  FormSectionPlugins,
  FormSectionService,
  FormSectionUpstream,
} from '../FormPartRoute';
import { FormSection } from '../FormSection';
import type { StreamRoutePostType } from './schema';

const FormSectionStreamRouteBasic = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<StreamRoutePostType>();

  return (
    <FormSection legend={t('form.streamRoute.server')}>
      <FormItemTextInput
        control={control}
        name="server_addr"
        label={t('form.streamRoute.serverAddr')}
      />
      <FormItemNumberInput
        control={control}
        name="server_port"
        label={t('form.streamRoute.serverPort')}
        allowDecimal={false}
      />
      <FormItemTextInput
        control={control}
        name="remote_addr"
        label={t('form.streamRoute.remoteAddr')}
      />
      <FormItemTextInput
        control={control}
        name="sni"
        label={t('form.streamRoute.sni')}
      />
    </FormSection>
  );
};

const FormSectionStreamRouteProtocol = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<StreamRoutePostType>();

  return (
    <FormSection legend={t('form.streamRoute.protocol.title')}>
      <FormItemTextInput
        control={control}
        name="protocol.name"
        label={t('form.streamRoute.protocol.name')}
      />
      <FormItemTextInput
        control={control}
        name="protocol.superior_id"
        label={t('form.streamRoute.protocol.superiorId')}
      />
      <FormItemJsonInput
        control={control}
        name="protocol.conf"
        label={t('form.streamRoute.protocol.conf')}
      />
      <FormItemJsonInput
        control={control}
        name="protocol.logger"
        label={t('form.streamRoute.protocol.logger')}
        toObject
      />
    </FormSection>
  );
};

export const FormPartStreamRoute = () => {
  return (
    <>
      <FormPartBasic showStatus showName={false} />
      <FormSectionStreamRouteBasic />
      <FormSectionService />
      <FormSectionUpstream />
      <FormSectionPlugins />
      <FormSectionStreamRouteProtocol />
    </>
  );
};
