import { useTranslation } from 'react-i18next';
import { FormSection } from '../FormSection';
import { useFormContext } from 'react-hook-form';
import { FormItemTextInput } from '@/components/form/TextInput';
import { FormItemNumberInput } from '@/components/form/NumberInput';
import { FormPartBasic } from '../FormPartBasic';
import type { StreamRoutePostType } from './schema';
import {
  FormSectionPlugins,
  FormSectionService,
  FormSectionUpstream,
} from '../FormPartRoute';
import { FormItemJsonInput } from '@/components/form/JsonInput';

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
