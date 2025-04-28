import { useFormContext, useWatch } from 'react-hook-form';
import type { A6Type } from '@/types/schema/apisix';
import { FormItemTextInput } from '../form/TextInput';
import { FormSection } from './FormSection';
import { useTranslation } from 'react-i18next';
import { FormDisplayDate } from './FormDisplayDate';
import { Divider, type TextInputProps } from '@mantine/core';

const DisplayDate = () => {
  const { control } = useFormContext<A6Type['Info']>();
  const { t } = useTranslation();
  const createTime = useWatch({ control, name: 'create_time' });
  const updateTime = useWatch({ control, name: 'update_time' });

  return (
    <>
      <Divider my="lg" />
      <FormDisplayDate date={createTime} label={t('form.info.create_time')} />
      <FormDisplayDate date={updateTime} label={t('form.info.update_time')} />
    </>
  );
};

const FormItemID = (props: Pick<TextInputProps, 'disabled'>) => {
  const { control } = useFormContext<A6Type['Info']>();
  const { t } = useTranslation();
  const { disabled } = props;

  return (
    <FormItemTextInput
      control={control}
      name="id"
      label={t('form.info.id')}
      disabled={disabled}
    />
  );
};

type FormSectionInfoProps = {
  showDate?: boolean;
  disableID?: boolean;
};

export const FormSectionInfo = (props: FormSectionInfoProps) => {
  const { showDate = true, disableID = false } = props;
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.general.title')} disabled={disableID}>
      <FormItemID />
      {showDate && <DisplayDate />}
    </FormSection>
  );
};
