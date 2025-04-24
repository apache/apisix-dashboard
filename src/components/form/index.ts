import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { Text } from './Text';
import { SubmitBtn } from './SubscribeBtn';
import { TextArray } from './TextArray';
import { Textarea } from './Textarea';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Text,
    Textarea,
    TextArray,
  },
  formComponents: {
    SubmitBtn,
  },
});

