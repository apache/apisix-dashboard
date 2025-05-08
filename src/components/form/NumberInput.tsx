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
