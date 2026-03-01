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

import { Select } from '@mantine/core';
import { useController, useFormContext } from 'react-hook-form';

import type { FieldProps } from '../types';
import { getFieldDescription, getFieldLabel } from '../utils';

export const EnumField: React.FC<FieldProps> = ({
  schema,
  name,
  required,
  disabled,
}) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: schema.default ?? undefined,
    rules: {
      required: required ? 'This field is required' : false,
    },
  });

  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  const options = (schema.enum ?? []).map((val) => ({
    value: String(val),
    label: String(val),
  }));

  return (
    <Select
      label={label}
      description={description}
      error={error?.message}
      required={required}
      disabled={disabled}
      ref={ref}
      onBlur={onBlur}
      value={value !== undefined && value !== null ? String(value) : null}
      onChange={(val) => {
        if (val === null) {
          onChange(undefined);
          return;
        }
        // Try to convert back to the original type
        const originalEnum = schema.enum ?? [];
        const match = originalEnum.find((e) => String(e) === val);
        onChange(match !== undefined ? match : val);
      }}
      data={options}
      comboboxProps={{ shadow: 'md' }}
      allowDeselect={!required}
      clearable={!required}
    />
  );
};
