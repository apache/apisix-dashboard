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
import { NumberInput, type NumberInputProps } from '@mantine/core';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import { genControllerProps } from './util';

export type FormItemNumberInputProps<T extends FieldValues> =
  UseControllerProps<T> & NumberInputProps;

export const FormItemNumberInput = <T extends FieldValues>(
  props: FormItemNumberInputProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props);
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <NumberInput
      value={value}
      error={fieldState.error?.message}
      onChange={(e) => {
        restProps.onChange?.(e);
        // Mantine's NumberInput returns a string when the value is empty
        const val = typeof e === 'string' ? undefined : e;
        fOnChange(val);
      }}
      {...restField}
      {...restProps}
    />
  );
};
