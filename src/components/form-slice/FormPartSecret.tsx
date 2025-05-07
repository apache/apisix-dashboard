import { useFormContext } from 'react-hook-form';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { FormSectionGeneral } from './FormSectionGeneral';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTextInput } from '@/components/form/TextInput';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';
import { FormItemSelect } from '@/components/form/Select';
import { Divider, InputWrapper } from '@mantine/core';
import { FormItemTagsInput } from '../form/TagInput';

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

type FormSectionManagerProps = { disableManager?: boolean };
const FormSectionManager = (props: FormSectionManagerProps) => {
  const { disableManager } = props;
  const { t } = useTranslation();
  const { control } = useFormContext<APISIXType['Secret']>();
  return (
    <FormSection legend={t('form.secrets.manager')}>
      <FormItemSelect
        control={control}
        name="manager"
        defaultValue={APISIX.Secret.options[0].shape.manager.value}
        data={APISIX.Secret.options.map((v) => v.shape.manager.value)}
        disabled={disableManager}
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
  const { disableManager } = props;
  return (
    <>
      <FormSectionGeneral showDate={false} disableID={disableManager} />
      <FormSectionManager disableManager={disableManager} />
      <FormSectionManagerConfig />
    </>
  );
};
