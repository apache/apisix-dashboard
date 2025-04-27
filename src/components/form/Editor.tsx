import { InputWrapper, type InputWrapperProps } from '@mantine/core';
import { Editor, loader } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';
import { useMount } from 'react-use';

const setupMonaco = () => {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
  };

  loader.config({ monaco });
};

type FormItemEditorProps<T extends FieldValues> = InputWrapperProps &
  UseControllerProps<T>;
export const FormItemEditor = <T extends FieldValues>(
  props: FormItemEditorProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, '');
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);

  useMount(() => {
    setupMonaco();
  });

  return (
    <InputWrapper error={fieldState.error?.message} {...restProps}>
      <input name={restField.name} type="hidden" />
      <Editor
        value={value}
        onChange={(v) => {
          fOnChange(v);
        }}
      />
    </InputWrapper>
  );
};
