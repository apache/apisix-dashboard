import { TagsInput, type TagsInputProps } from '@mantine/core';
import { useFieldContext } from '.';
import type { FC } from 'react';
import type { IssueData } from 'zod';

export const TextArray: FC<TagsInputProps> = (props) => {
  const field = useFieldContext<string[]>();
  return (
    <TagsInput
      value={field.state.value}
      onChange={(data) => field.handleChange(data)}
      onBlur={field.handleBlur}
      {...(field.state.meta.errors.length && {
        error: (field.state.meta.errors as IssueData[])[0].message,
      })}
      {...props}
    />
  );
};
