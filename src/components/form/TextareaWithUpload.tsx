/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Box,
  Button,
  Group,
  Input,
  Textarea as MTextarea,
  type TextareaProps as MTextareaProps,
} from '@mantine/core';
import { useRef, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import IconUpload from '~icons/material-symbols/upload';

import { genControllerProps } from './util';

export type FormItemTextareaWithUploadProps<T extends FieldValues> =
  UseControllerProps<T> &
    MTextareaProps & {
      acceptFileTypes?: string;
      uploadButtonText?: string;
      maxFileSize?: number;
      onFileLoaded?: (content: string, fileName: string) => void;
      allowUpload?: boolean;
    };

export const FormItemTextareaWithUpload = <T extends FieldValues>(
  props: FormItemTextareaWithUploadProps<T>
) => {
  const { allowUpload = true } = props;
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const { t } = useTranslation();

  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    acceptFileTypes = '',
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
        autosize={restField.disabled}
        {...restField}
        {...textareaProps}
      />
      {allowUpload && !restField.disabled && (
        <Group mb="xs" mt={4}>
          <Button
            leftSection={<IconUpload />}
            size="compact-xs"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
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
      )}
      <Input.Error>{fieldState.error?.message || fileError}</Input.Error>
    </Box>
  );
};
