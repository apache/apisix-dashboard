import { type FieldValues,useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { APISIXType } from '@/types/schema/apisix';

import {
  FormItemTextareaWithUpload,
  type FormItemTextareaWithUploadProps,
} from '../form/TextareaWithUpload';

export const FormPartProto = <T extends FieldValues>(
  props: Pick<FormItemTextareaWithUploadProps<T>, 'allowUpload'>
) => {
  const { t } = useTranslation();
  const form = useFormContext<APISIXType['ProtoPost']>();
  return (
    <FormItemTextareaWithUpload
      name="content"
      label={t('protos.form.content')}
      placeholder={t('protos.form.contentPlaceholder')}
      control={form.control}
      minRows={10}
      acceptFileTypes=".proto,.pb"
      {...props}
    />
  );
};
