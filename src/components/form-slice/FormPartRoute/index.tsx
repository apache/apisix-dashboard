import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormItemSwitch } from '@/components/form/Switch';
import { FormItemTagsInput } from '@/components/form/TagInput';
import { FormItemTextarea } from '@/components/form/Textarea';
import { FormItemTextInput } from '@/components/form/TextInput';
import { NamePrefixProvider } from '@/utils/useNamePrefix';
import { FormItemPlugins } from '../FormItemPlugins';
import { FormPartBasic } from '../FormPartBasic';
import { FormPartUpstream } from '../FormPartUpstream';
import { FormSection } from '../FormSection';
import { Divider, InputWrapper } from '@mantine/core';
import type { RoutePostType } from './schema';
import { FormItemSelect } from '@/components/form/Select';
import { APISIX } from '@/types/schema/apisix';

const FormPartBasicWithPriority = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormPartBasic>
      <FormItemNumberInput
        control={control}
        name="priority"
        label={t('form.route.priority')}
      />
      <FormItemSelect
        control={control}
        name="status"
        label={t('form.route.status')}
        data={APISIX.RouteStatus.options.map((v) => v.value.toString())}
        defaultValue={APISIX.RouteStatus.options[1].value.toString()}
        from={String}
        to={Number}
      />
    </FormPartBasic>
  );
};

const FormSectionMatchRules = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.route.matchRules')}>
      <FormItemTagsInput
        control={control}
        name="methods"
        label={t('form.route.methods')}
        data={APISIX.HttpMethod.options.map((v) => v.value)}
        searchValue=""
      />
      <InputWrapper label={t('form.route.enableWebsocket')}>
        <FormItemSwitch control={control} name="enable_websocket" />
      </InputWrapper>
      <FormItemTextInput
        control={control}
        name="uri"
        label={t('form.route.uri')}
      />
      <FormItemTagsInput
        control={control}
        name="uris"
        label={t('form.route.uris')}
      />
      <FormItemTextInput
        control={control}
        name="host"
        label={t('form.route.host')}
      />
      <FormItemTagsInput
        control={control}
        name="hosts"
        label={t('form.route.hosts')}
      />
      <FormItemTextInput
        control={control}
        name="remote_addr"
        label={t('form.route.remoteAddr')}
      />
      <FormItemTagsInput
        control={control}
        name="remote_addrs"
        label={t('form.route.remoteAddrs')}
      />
      <FormItemTagsInput
        control={control}
        name="vars"
        label={t('form.route.vars')}
      />
      <FormItemTextarea
        control={control}
        name="filter_func"
        label={t('form.route.filterFunc')}
      />
    </FormSection>
  );
};

const FormSectionUpstream = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.upstream.title')}>
      <FormSection legend={t('form.upstream.upstreamId')}>
        <FormItemTextInput
          control={control}
          name="upstream_id"
          label={t('form.upstream.upstreamId')}
        />
      </FormSection>
      <Divider my="xs" label={t('or')} />
      <NamePrefixProvider value="upstream">
        <FormPartUpstream />
      </NamePrefixProvider>
    </FormSection>
  );
};

const FormSectionPlugins = () => {
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

const FormSectionService = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<RoutePostType>();
  return (
    <FormSection legend={t('form.route.service')}>
      <FormItemTextInput
        control={control}
        name="service_id"
        label={t('form.upstream.serviceId')}
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
      <FormSectionUpstream />
      <FormSectionPlugins />
    </>
  );
};
