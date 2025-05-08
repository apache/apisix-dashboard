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
