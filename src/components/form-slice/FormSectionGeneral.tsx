import { useFormContext, useWatch } from 'react-hook-form';
import type { APISIXType } from '@/types/schema/apisix';
import { FormItemTextInput } from '../form/TextInput';
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

const FormItemID = () => {
  const { control } = useFormContext<APISIXType['Info']>();
  const { t } = useTranslation();

  return (
    <FormItemTextInput control={control} name="id" label={t('form.info.id')} />
  );
};

type FormSectionInfoProps = {
  showDate?: boolean;
  showID?: boolean;
};

export const FormSectionGeneral = (props: FormSectionInfoProps) => {
  const { showDate = true, showID = false } = props;
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.general.title')} >
      {showID && <FormItemID />}
      {showID && showDate && <Divider my="lg" />}
      {showDate && <DisplayDate />}
    </FormSection>
  );
};
