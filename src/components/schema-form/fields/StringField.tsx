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

import { PasswordInput, TextInput, Textarea } from '@mantine/core';
import { useController, useFormContext } from 'react-hook-form';

import type { FieldProps } from '../types';
import { getFieldDescription, getFieldLabel, isEncryptField } from '../utils';

export const StringField: React.FC<FieldProps> = ({
  schema,
  name,
  required,
  encryptFields,
  disabled,
}) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: schema.default ?? '',
    rules: {
      required: required ? 'This field is required' : false,
      minLength: schema.minLength
        ? { value: schema.minLength, message: `Minimum ${schema.minLength} characters` }
        : undefined,
      maxLength: schema.maxLength
        ? { value: schema.maxLength, message: `Maximum ${schema.maxLength} characters` }
        : undefined,
      pattern: schema.pattern
        ? { value: new RegExp(schema.pattern), message: `Must match pattern: ${schema.pattern}` }
        : undefined,
    },
  });

  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);
  const isEncrypted = isEncryptField(name, encryptFields);

  const commonProps = {
    label,
    description,
    error: error?.message,
    required,
    disabled,
    ref,
    onBlur,
  };

  if (isEncrypted) {
    return (
      <PasswordInput
        {...commonProps}
        value={value ?? ''}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    );
  }

  // Use Textarea for long strings
  if (schema.maxLength && schema.maxLength > 256) {
    return (
      <Textarea
        {...commonProps}
        value={value ?? ''}
        onChange={(e) => onChange(e.currentTarget.value)}
        autosize
        minRows={3}
        maxRows={10}
      />
    );
  }

  return (
    <TextInput
      {...commonProps}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={schema.pattern ? `Pattern: ${schema.pattern}` : undefined}
    />
  );
};
