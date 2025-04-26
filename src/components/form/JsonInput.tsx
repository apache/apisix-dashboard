import { JsonInput, type JsonInputProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
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
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <JsonInput
      value={typeof value === 'object' ? JSON.stringify(value) : value}
      error={fieldState.error?.message}
      onChange={(e) => {
        const res = props.toObject ? JSON.parse(e) : e;
        fOnChange(res);
        restProps.onChange?.(res);
      }}
      {...restField}
      {...restProps}
    />
  );
};
