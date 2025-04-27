import { TagsInput, type TagsInputProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemTextArrayProps<T extends FieldValues> =
  UseControllerProps<T> & TagsInputProps;

export const FormItemTextArray = <T extends FieldValues>(
  props: FormItemTextArrayProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, []);

  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  return (
    <TagsInput
      value={value}
      error={fieldState.error?.message}
      onChange={(value) => {
        fOnChange(value);
        restProps?.onChange?.(value);
      }}
      {...restField}
      {...restProps}
    />
  );
};
