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
import { JsonInput, type JsonInputProps } from '@mantine/core';
import { useMemo } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import { genControllerProps } from './util';

export type FormItemJsonInputProps<T extends FieldValues> =
  UseControllerProps<T> &
    JsonInputProps & {
      toObject?: boolean;
    };

export const FormItemJsonInput = <T extends FieldValues>(
  props: FormItemJsonInputProps<T>
) => {
  const {
    controllerProps,
    restProps: { toObject, ...restProps },
  } = genControllerProps(props, '');
  const {
    field: { value: rawVal, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const value = useMemo(() => {
    if (!toObject) return rawVal;
    if (typeof rawVal === 'string') return rawVal;
    const val = JSON.stringify(rawVal, null, 2);
    if (val === '{}') return '';
    return val;
  }, [rawVal, toObject]);

  return (
    <JsonInput
      value={value}
      error={fieldState.error?.message}
      onChange={(val) => {
        let res: unknown;
        if (toObject) {
          try {
            res = JSON.parse(val);
          } catch {
            res = val.length === 0 ? {} : val;
          }
        }
        fOnChange(res);
        restProps.onChange?.(val);
      }}
      formatOnBlur
      autosize
      resize="vertical"
      {...restField}
      {...restProps}
    />
  );
};
