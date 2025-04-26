import {
  Textarea as MTextarea,
  type TextareaProps as MTextareaProps,
} from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemTextareaProps<T extends FieldValues> =
  UseControllerProps<T> & MTextareaProps;

export const FormItemTextarea = <T extends FieldValues>(
  props: FormItemTextareaProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <MTextarea
      value={value}
      error={fieldState.error?.message}
      onChange={(e) => {
        fOnChange(e);
        restProps.onChange?.(e);
      }}
      resize="vertical"
      {...restField}
      {...restProps}
    />
  );
};
