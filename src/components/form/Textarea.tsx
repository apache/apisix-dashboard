import { Textarea as MTextarea, type TextareaProps } from '@mantine/core';
import { useFieldContext } from '.';
import type { FC } from 'react';
import type { IssueData } from 'zod';

export const Textarea: FC<TextareaProps> = (props) => {
  const field = useFieldContext<string>();
  return (
    <MTextarea
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
