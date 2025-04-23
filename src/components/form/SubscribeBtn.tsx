import { Button, type ButtonProps } from '@mantine/core';
import { useFormContext } from '.';
import type { FC } from 'react';

export const SubmitBtn: FC<ButtonProps> = (props) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          loading={isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          {...props}
        />
      )}
    </form.Subscribe>
  );
};
