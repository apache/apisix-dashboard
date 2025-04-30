import type { APISIXType } from '@/types/schema/apisix';
import { useFormContext, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  FileUploadTextarea,
  type FileUploadTextareaProps,
} from '../form/FileUploadTextarea';

export const FormPartProto = <T extends FieldValues>(
  props: Pick<FileUploadTextareaProps<T>, 'allowUpload'>
) => {
  const { t } = useTranslation();
  const form = useFormContext<APISIXType['ProtoPost']>();
  return (
    <FileUploadTextarea
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
