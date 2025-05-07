import { useFormContext, useWatch } from 'react-hook-form';
import type { APISIXType } from '@/types/schema/apisix';
import {
  FormItemTextInput,
  type FormItemTextInputProps,
} from '../form/TextInput';
import { FormSection } from './FormSection';
import { useTranslation } from 'react-i18next';
import { FormDisplayDate } from './FormDisplayDate';
import { Divider } from '@mantine/core';

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

const FormItemID = (
  props: Omit<
    FormItemTextInputProps<APISIXType['Info']>,
    'name' | 'label' | 'control'
  >
) => {
  const { control } = useFormContext<APISIXType['Info']>();
  const { t } = useTranslation();
  return (
    <FormItemTextInput
      control={control}
      name="id"
      label={t('form.info.id')}
      {...props}
    />
  );
};

export type FormSectionGeneralProps = {
  showDate?: boolean;
  showID?: boolean;
  disableID?: boolean;
};

export const FormSectionGeneral = (props: FormSectionGeneralProps) => {
  const { showDate = true, showID = true, disableID = false } = props;
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.general.title')}>
      {showID && <FormItemID disabled={disableID} />}
      {showID && showDate && <Divider my="lg" />}
      {showDate && <DisplayDate />}
    </FormSection>
  );
};
