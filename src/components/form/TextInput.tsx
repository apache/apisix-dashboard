import { TextInput, type TextInputProps } from '@mantine/core';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';

import { genControllerProps } from './util';

export type FormItemTextInputProps<T extends FieldValues> =
  UseControllerProps<T> & TextInputProps;

export const FormItemTextInput = <T extends FieldValues>(
  props: FormItemTextInputProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <TextInput
      value={value}
      error={fieldState.error?.message}
      onChange={(e) => {
        fOnChange(e);
        restProps.onChange?.(e);
      }}
      {...restField}
      {...restProps}
    />
  );
};
