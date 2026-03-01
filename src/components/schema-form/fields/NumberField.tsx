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

import { NumberInput } from '@mantine/core';
import { useController, useFormContext } from 'react-hook-form';

import type { FieldProps } from '../types';
import { getFieldDescription, getFieldLabel, getSchemaType } from '../utils';

export const NumberField: React.FC<FieldProps> = ({
  schema,
  name,
  required,
  disabled,
}) => {
  const { control } = useFormContext();
  const schemaType = getSchemaType(schema);
  const isInteger = schemaType === 'integer';

  const min =
    schema.minimum ??
    (typeof schema.exclusiveMinimum === 'number'
      ? schema.exclusiveMinimum + (isInteger ? 1 : 0.001)
      : undefined);
  const max =
    schema.maximum ??
    (typeof schema.exclusiveMaximum === 'number'
      ? schema.exclusiveMaximum - (isInteger ? 1 : 0.001)
      : undefined);

  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: schema.default ?? undefined,
    rules: {
      required: required ? 'This field is required' : false,
      min: min !== undefined ? { value: min, message: `Must be >= ${min}` } : undefined,
      max: max !== undefined ? { value: max, message: `Must be <= ${max}` } : undefined,
    },
  });

  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  return (
    <NumberInput
      label={label}
      description={description}
      error={error?.message}
      required={required}
      disabled={disabled}
      ref={ref}
      onBlur={onBlur}
      value={value ?? ''}
      onChange={(val) => {
        // Mantine NumberInput returns '' when empty
        const numVal = typeof val === 'string' ? undefined : val;
        onChange(numVal);
      }}
      min={min}
      max={max}
      step={isInteger ? 1 : undefined}
      allowDecimal={!isInteger}
      placeholder={
        min !== undefined && max !== undefined
          ? `${min} - ${max}`
          : undefined
      }
    />
  );
};
