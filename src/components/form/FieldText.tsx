import { TextInput, TextInputProps } from '@mantine/core';
import { useFieldContext } from '.';
import { FC } from 'react';

export const FieldText: FC<TextInputProps> = (props) => {
  const field = useFieldContext<string>();
  return (
    <TextInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      {...props}
    />
  );
};
