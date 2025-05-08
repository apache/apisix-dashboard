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
