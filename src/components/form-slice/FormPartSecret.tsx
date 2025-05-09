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

import { FormItemSelect } from '@/components/form/Select';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTextInput } from '@/components/form/TextInput';
import { APISIX, type APISIXType } from '@/types/schema/apisix';

import { FormItemTagsInput } from '../form/TagInput';
import { FormSection } from './FormSection';

const VaultSecretForm = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['Secret']>();

  return (
    <>
      <FormItemTextInput
        control={control}
        name="uri"
        label={t('form.secrets.vault.uri')}
      />
      <FormItemTextInput
        control={control}
        name="prefix"
        label={t('form.secrets.vault.prefix')}
      />
      <FormItemTextInput
        control={control}
        name="token"
        label={t('form.secrets.vault.token')}
      />
      <FormItemTextInput
        control={control}
        name="namespace"
        label={t('form.secrets.vault.namespace')}
      />
    </>
  );
};

const AWSSecretForm = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['Secret']>();

  return (
    <>
      <FormItemTextInput
        control={control}
        name="access_key_id"
        label={t('form.secrets.aws.access_key_id')}
      />
      <FormItemTextInput
        control={control}
        name="secret_access_key"
        label={t('form.secrets.aws.secret_access_key')}
      />
      <FormItemTextInput
        control={control}
        name="session_token"
        label={t('form.secrets.aws.session_token')}
      />

      <FormItemTextInput
        control={control}
        name="region"
        label={t('form.secrets.aws.region')}
      />
      <FormItemTextInput
        control={control}
        name="endpoint_url"
        label={t('form.secrets.aws.endpoint_url')}
      />
    </>
  );
};

const GCPSecretForm = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['Secret']>();

  return (
    <>
      <InputWrapper label={t('form.secrets.gcp.ssl_verify')}>
        <FormItemSwitch control={control} name="ssl_verify" />
      </InputWrapper>
      <FormSection legend={t('form.secrets.gcp.auth')}>
        <FormItemTextInput
          control={control}
          name="auth_file"
          label={t('form.secrets.gcp.auth_file')}
        />
        <Divider my="xs" label={t('or')} />
        <FormSection legend={t('form.secrets.gcp.auth_config')}>
          <FormItemTextInput
            control={control}
            name="auth_config.client_email"
            label={t('form.secrets.gcp.client_email')}
          />
          <FormItemTextInput
            control={control}
            name="auth_config.private_key"
            label={t('form.secrets.gcp.private_key')}
          />
          <FormItemTextInput
            control={control}
            name="auth_config.project_id"
            label={t('form.secrets.gcp.project_id')}
          />
          <FormItemTextInput
            control={control}
            name="auth_config.token_uri"
            label={t('form.secrets.gcp.token_uri')}
          />
          <FormItemTagsInput
            control={control}
            name="auth_config.scope"
            label={t('form.secrets.gcp.scope')}
          />
          <FormItemTextInput
            control={control}
            name="auth_config.entries_uri"
            label={t('form.secrets.gcp.entries_uri')}
          />
        </FormSection>
      </FormSection>
    </>
  );
};

type FormSectionManagerProps = { readOnlyManager?: boolean };
const FormSectionManager = (props: FormSectionManagerProps) => {
  const { readOnlyManager } = props;
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['Secret']>();
  return (
    <FormSection legend={t('form.secrets.manager')} disabled={readOnlyManager}>
      <FormItemSelect
        control={control}
        name="manager"
        defaultValue={APISIX.Secret.options[0].shape.manager.value}
        data={APISIX.Secret.options.map((v) => v.shape.manager.value)}
      />
    </FormSection>
  );
};

const FormSectionManagerConfig = () => {
  const { t } = useTranslation();
  const { watch } = useFormContext<APISIXType['Secret']>();
  // useWatch not working here
  const manager = watch('manager');
  return (
    <FormSection legend={t('form.secrets.managerConfig')}>
      {manager === 'vault' && <VaultSecretForm />}
      {manager === 'aws' && <AWSSecretForm />}
      {manager === 'gcp' && <GCPSecretForm />}
    </FormSection>
  );
};

/**
 * id and manager cannot be changed when editing
 */
export const FormPartSecret = (props: FormSectionManagerProps) => {
  const { readOnlyManager } = props;
  return (
    <>
      <FormSectionManager readOnlyManager={readOnlyManager} />
      <FormSectionManagerConfig />
    </>
  );
};
