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
import { Divider } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { APISIXType } from '@/types/schema/apisix';

import { FormItemTextInput } from '../form/TextInput';
import { FormDisplayDate } from './FormDisplayDate';
import { FormSection } from './FormSection';

const DisplayDate = () => {
  const { control } = useFormContext<APISIXType['Info']>();
  const { t } = useTranslation();
  const createTime = useWatch({ control, name: 'create_time' });
  const updateTime = useWatch({ control, name: 'update_time' });
  return (
    <>
      <FormDisplayDate date={createTime} label={t('form.info.create_time')} />
      <FormDisplayDate date={updateTime} label={t('form.info.update_time')} />
    </>
  );
};

const FormItemID = () => {
  const { control } = useFormContext<APISIXType['Info']>();
  const { t } = useTranslation();
  return (
    <FormItemTextInput control={control} name="id" label={t('form.info.id')} />
  );
};

export type FormSectionGeneralProps = {
  showDate?: boolean;
  showID?: boolean;
  readOnly?: boolean;
};

export const FormSectionGeneral = (props: FormSectionGeneralProps) => {
  const { showDate = true, showID = true, readOnly = false } = props;
  const { t } = useTranslation();
  // we use fieldset disabled to show readonly state
  // because mantine readOnly style looks like we can edit
  // this is also the way rhf recommends,
  // Using disable directly on the component will cause rhf to ignore the value
  return (
    <FormSection legend={t('form.general.title')} disabled={readOnly}>
      {showID && <FormItemID />}
      {showID && showDate && <Divider my="lg" />}
      {showDate && <DisplayDate />}
    </FormSection>
  );
};
