import { Switch, type SwitchProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemSwitchProps<T extends FieldValues> = Omit<
  UseControllerProps<T> & SwitchProps,
  'defaultValue'
>;

export const FormItemSwitch = <T extends FieldValues>(
  props: FormItemSwitchProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, false);
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <Switch
      labelPosition="left"
      value={value}
      checked={value}
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
