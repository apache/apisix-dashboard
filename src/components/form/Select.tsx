import { Select, type SelectProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemSelectProps<
  T extends FieldValues,
  R
> = UseControllerProps<T> &
  SelectProps & {
    from?: (v: R) => string;
    to?: (v: string) => R;
  };

export const FormItemSelect = <T extends FieldValues, R>(
  props: FormItemSelectProps<T, R>
) => {
  const {
    controllerProps,
    restProps: { from, to, ...restProps },
  } = genControllerProps(props, []);

  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <Select
      value={from ? from(value) : value}
      error={fieldState.error?.message}
      onChange={(value, option) => {
        const val = to && value ? to(value) : value;
        fOnChange(val);
        restProps?.onChange?.(value, option);
      }}
      comboboxProps={{ shadow: 'md' }}
      {...restField}
      {...restProps}
    />
  );
};
