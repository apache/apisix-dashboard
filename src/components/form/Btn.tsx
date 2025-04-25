import { Button, type ButtonProps } from '@mantine/core';
import type { FC } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

export const FormSubmitBtn: FC<ButtonProps> = (props) => {
  const form = useFormContext();
  const { isSubmitting } = useFormState(form);
  return <Button type="submit" loading={isSubmitting} {...props} />;
};
