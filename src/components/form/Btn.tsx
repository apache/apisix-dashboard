import { Button, type ButtonProps } from '@mantine/core';
import { useFormContext, useFormState } from 'react-hook-form';

export const FormSubmitBtn = (props: ButtonProps) => {
  const form = useFormContext();
  const { isSubmitting } = useFormState(form);
  return <Button type="submit" loading={isSubmitting} {...props} />;
};
