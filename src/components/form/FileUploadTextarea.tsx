import {
  Textarea as MTextarea,
  type TextareaProps as MTextareaProps,
  Box,
  Group,
  Button,
  Input,
} from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';
import IconUpload from '~icons/material-symbols/upload';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type FileUploadTextareaProps<T extends FieldValues> =
  UseControllerProps<T> &
    MTextareaProps & {
      acceptFileTypes?: string;
      uploadButtonText?: string;
      maxFileSize?: number;
      onFileLoaded?: (content: string, fileName: string) => void;
    };

export const FileUploadTextarea = <T extends FieldValues>(
  props: FileUploadTextareaProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const { t } = useTranslation();

  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    acceptFileTypes = '.txt,.json,.yaml,.yml',
    uploadButtonText = '',
    maxFileSize = 10 * 1024 * 1024,
    onFileLoaded,
    onChange,
    ...textareaProps
  } = restProps;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      const size = Math.round(maxFileSize / 1024 / 1024);
      setFileError(`${t('form.upload.fileOverSize')} ${size}MB`);
      return;
    }

    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      fOnChange(content);
      onFileLoaded?.(content, file.name);
    };

    reader.onerror = (e) => {
      setFileError(`${t('form.upload.readError')} ${e.target?.error}`);
    };

    reader.readAsText(file);
  };

  return (
    <Box>
      <MTextarea
        value={value}
        onChange={(e) => {
          fOnChange(e);
          onChange?.(e);
        }}
        resize="vertical"
        {...restField}
        {...textareaProps}
      />
      <Group mb="xs" mt={4}>
        <Button
          leftSection={<IconUpload />}
          size="compact-xs"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={restField.disabled}
        >
          {uploadButtonText || t('form.btn.upload')}
        </Button>
        <input
          type="file"
          accept={acceptFileTypes}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </Group>
      <Input.Error>{fieldState.error?.message || fileError}</Input.Error>
    </Box>
  );
};
