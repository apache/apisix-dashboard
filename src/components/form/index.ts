import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { FieldText } from './FieldText';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FieldText,
  },
  formComponents: {},
});
