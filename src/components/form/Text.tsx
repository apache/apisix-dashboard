import { TextInput, type TextInputProps } from '@mantine/core';
import { useFieldContext } from '.';
import type { FC } from 'react';
import type { IssueData } from 'zod';

export const Text: FC<TextInputProps> = (props) => {
  const field = useFieldContext<string>();
  return (
    <TextInput
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      {...(field.state.meta.errors.length && {
        error: (field.state.meta.errors as IssueData[])[0].message,
      })}
      {...props}
    />
  );
};
