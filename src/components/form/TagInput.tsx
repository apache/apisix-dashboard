import { TagsInput, type TagsInputProps } from '@mantine/core';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemTagsInputProps<
  T extends FieldValues,
  R
> = UseControllerProps<T> &
  TagsInputProps & {
    from?: (v: R) => string;
    to?: (v: string) => R;
  };

export const FormItemTagsInput = <T extends FieldValues, R>(
  props: FormItemTagsInputProps<T, R>
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
    <TagsInput
      value={from ? value.map(from) : value}
      error={fieldState.error?.message}
      onChange={(value) => {
        const val = to ? value.map(to) : value;
        fOnChange(val);
        restProps?.onChange?.(value);
      }}
      comboboxProps={{ shadow: 'md' }}
      {...restField}
      {...restProps}
    />
  );
};
