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
import { TagsInput, type TagsInputProps } from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { APISIXType } from '@/types/schema/apisix';

import { genControllerProps } from './util';

export type FormItemLabels<T extends FieldValues> = UseControllerProps<T> &
  Omit<TagsInputProps, 'value' | 'onChange' | 'onBlur' | 'defaultValue'> & {
    onChange?: (value: APISIXType['Labels']) => void;
    defaultValue?: APISIXType['Labels'];
  };

export const FormItemLabels = <T extends FieldValues>(
  props: FormItemLabels<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props);
  const {
    field: { value, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const { t } = useTranslation();
  const [internalError, setInternalError] = useState<string | null>();

  const values = useMemo(() => {
    if (!value) return [];
    return Object.entries(value).map(([key, val]) => `${key}:${val}`);
  }, [value]);

  const handleSearchChange = useCallback(
    (val: string) => {
      const tuple = val.split(':');
      // when clear input, val can be ''
      if (val && tuple.length !== 2) {
        setInternalError(t('form.basic.labels.errorFormat'));
        return;
      }
      setInternalError(null);
    },
    [t]
  );

  const handleChange = useCallback(
    (vals: string[]) => {
      const obj: APISIXType['Labels'] = {};
      for (const val of vals) {
        const tuple = val.split(':');
        if (tuple.length !== 2) {
          setInternalError(t('form.basic.labels.errorFormat'));
          return;
        }
        obj[tuple[0]] = tuple[1];
      }
      setInternalError(null);
      fOnChange(obj);
      restProps.onChange?.(obj);
    },
    [fOnChange, restProps, t]
  );

  return (
    <>
      <input name={fName} type="hidden" />
      <TagsInput
        acceptValueOnBlur
        clearable
        value={values}
        onSearchChange={handleSearchChange}
        splitChars={[',']}
        label={t('form.basic.labels.title')}
        placeholder={t('form.basic.labels.placeholder')}
        error={internalError || fieldState.error?.message}
        {...restField}
        {...restProps}
        onChange={handleChange}
      />
    </>
  );
};
