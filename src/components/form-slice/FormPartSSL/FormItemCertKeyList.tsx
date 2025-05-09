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
import { Button, Fieldset, type FieldsetProps,Stack } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormItemTextareaWithUpload } from '@/components/form/TextareaWithUpload';
import IconDelete from '~icons/material-symbols/delete-forever-outline';

import { FormSection } from '../FormSection';
import type { SSLPostType } from './schema';

const PairWrapper = (
  props: PropsWithChildren & Pick<FieldsetProps, 'legend'>
) => {
  const { children, legend } = props;
  return (
    <Fieldset p={8} mb={5} legend={legend}>
      <Stack flex={1} gap={1}>
        {children}
      </Stack>
    </Fieldset>
  );
};

const RequiredCertKey = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SSLPostType>();
  return (
    <PairWrapper>
      <FormItemTextareaWithUpload
        control={control}
        label={`${t('form.ssls.cert')} 1`}
        name="cert"
        required
      />
      <FormItemTextareaWithUpload
        control={control}
        label={`${t('form.ssls.key')} 1`}
        name="key"
        required
      />
    </PairWrapper>
  );
};
const CertKeyPairList = () => {
  const { t } = useTranslation();
  const certsState = useFormState<SSLPostType>({ name: 'certs' });
  const certs = useFieldArray({
    name: 'certs',
  });
  const keys = useFieldArray({
    name: 'keys',
  });
  return (
    <>
      {certs.fields.map((cert, idx) => (
        <PairWrapper
          key={cert.id}
          legend={
            !certsState.disabled && (
              <Button
                leftSection={<IconDelete />}
                justify="flex-end"
                size="compact-xs"
                color="red"
                variant="outline"
                onClick={() => {
                  certs.remove(idx);
                  keys.remove(idx);
                }}
              >
                {t('form.ssls.cert_key_list.delete')}
              </Button>
            )
          }
        >
          <FormItemTextareaWithUpload
            key={cert.id}
            name={`certs.${idx}`}
            label={`${t('form.ssls.cert')} ${idx + 2}`}
          />
          <FormItemTextareaWithUpload
            key={keys.fields[idx].id}
            name={`keys.${idx}`}
            label={`${t('form.ssls.key')} ${idx + 2}`}
          />
        </PairWrapper>
      ))}
      {!certsState.disabled && (
        <Button
          mt={16}
          fullWidth
          size="compact-sm"
          variant="outline"
          onClick={() => {
            keys.append('');
            certs.append('');
          }}
        >
          {t('form.ssls.cert_key_list.add')}
        </Button>
      )}
    </>
  );
};
export const FormItemCertKeyList = () => {
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.ssls.cert_key_list.title')}>
      <RequiredCertKey />
      <CertKeyPairList />
    </FormSection>
  );
};
