import { useFormContext, useWatch } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';
import { FormItemTextInput } from '../form/TextInput';
import { FormSection } from './FormSection';
import { useTranslation } from 'react-i18next';
import { FormDisplayDate } from './FormDisplayDate';
import { Divider } from '@mantine/core';

export const FormSectionInfo = () => {
  const { control } = useFormContext<A6Type['Info']>();
  const { t } = useTranslation();
  const createTime = useWatch({ control, name: 'create_time' });
  const updateTime = useWatch({ control, name: 'update_time' });
  return (
    <FormSection legend={t('form.info.title')}>
      <FormItemTextInput
        control={control}
        name="id"
        label="ID"
        readOnly
        disabled
      />
      <Divider my="lg" />
      <FormDisplayDate date={createTime} label={t('form.info.create_time')} />
      <FormDisplayDate date={updateTime} label={t('form.info.update_time')} />
    </FormSection>
  );
};
