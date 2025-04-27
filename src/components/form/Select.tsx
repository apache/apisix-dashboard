import { Select, type SelectProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemSelectProps<T extends FieldValues> = UseControllerProps<T> &
  SelectProps;

export const FormItemSelect = <T extends FieldValues>(
  props: FormItemSelectProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, []);

  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <Select
      value={value}
      error={fieldState.error?.message}
      onChange={(value, option) => {
        fOnChange(value);
        restProps?.onChange?.(value, option);
      }}
      comboboxProps={{ shadow: 'md' }}
      {...restField}
      {...restProps}
    />
  );
};
