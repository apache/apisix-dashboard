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
import type { PropsWithChildren, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { APISIXType } from '@/types/schema/apisix';
import { APISIXCommon } from '@/types/schema/apisix/common';
import { useNamePrefix } from '@/utils/useNamePrefix';

import { FormItemLabels } from '../form/Labels';
import { FormItemSelect } from '../form/Select';
import { FormItemTextarea } from '../form/Textarea';
import { FormItemTextInput } from '../form/TextInput';
import { FormSection, type FormSectionProps } from './FormSection';

export type FormPartBasicProps = Omit<FormSectionProps, 'form'> &
  PropsWithChildren & {
    before?: ReactNode;
    showStatus?: boolean;
    showName?: boolean;
    showDesc?: boolean;
    showLabels?: boolean;
  };

export const FormPartBasic = (props: FormPartBasicProps) => {
  const {
    before,
    children,
    showStatus = false,
    showName = true,
    showDesc = true,
    showLabels = true,
    ...restProps
  } = props;
  const { control } = useFormContext<APISIXType['Basic']>();
  const { t } = useTranslation();
  const np = useNamePrefix();

  return (
    <FormSection legend={t('form.basic.title')} {...restProps}>
      {before}
      {showName && (
        <FormItemTextInput
          name={np('name')}
          label={t('form.basic.name')}
          control={control}
        />
      )}
      {showDesc && (
        <FormItemTextarea
          name={np('desc')}
          label={t('form.basic.desc')}
          control={control}
        />
      )}
      {showLabels && <FormItemLabels name={np('labels')} control={control} />}
      {showStatus && (
        <FormItemSelect
          control={control}
          name="status"
          label={t('form.basic.status')}
          defaultValue={APISIXCommon.Status.options[1].value.toString()}
          data={APISIXCommon.Status.options.map((v) => v.value.toString())}
          from={String}
          to={Number}
        />
      )}
      {children}
    </FormSection>
  );
};
