/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { InputWrapper, type InputWrapperProps,Skeleton } from '@mantine/core';
import { Editor, loader, type Monaco,useMonaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { useEffect } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { genControllerProps } from './util';

type SetupMonacoProps = {
  monaco: Monaco;
  setError?: (err: string | null) => void;
};

const setupMonaco = (props: SetupMonacoProps) => {
  const { setError, monaco } = props;

  window.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
  };

  monaco.editor.onDidChangeMarkers(([uri]) => {
    const markers = monaco.editor.getModelMarkers({ resource: uri });
    if (markers.length === 0) {
      return setError?.(null);
    }
    const marker = markers[0];
    setError?.(marker.message);
  });

  loader.config({ monaco });

  loader.init();
};

const options: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  contextmenu: false,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'none',
  lineDecorationsWidth: 0,
  theme: 'vs-light',
  acceptSuggestionOnEnter: 'on',
  // auto adjust width and height to parent
  // see: https://github.com/Microsoft/monaco-editor/issues/543#issuecomment-321767059
  automaticLayout: true,
};

type FormItemEditorProps<T extends FieldValues> = InputWrapperProps &
  UseControllerProps<T> & {
    language?: string;
    isLoading?: boolean;
    customSchema?: object;
  };
export const FormItemEditor = <T extends FieldValues>(
  props: FormItemEditorProps<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props, '');
  const { customSchema, language, isLoading, ...wrapperProps } = restProps;
  const { setError, clearErrors } = useFormContext<{
    [name: string]: object;
  }>();
  const customErrorField = `${props.name}-editor`;
  const { errors } = useFormState({ name: customErrorField });
  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);

  const monaco = useMonaco();
  useEffect(() => {
    if (!monaco || isLoading || !customSchema) return;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      ...monaco.languages.json.jsonDefaults.diagnosticsOptions,
      validate: true,
      schemas: [
        {
          uri: 'https://apisix.apache.org',
          fileMatch: ['*'],
          schema: customSchema,
        },
      ],
      trailingCommas: 'error',
      enableSchemaRequest: false,
    });
  }, [customSchema, monaco, isLoading]);
  return (
    <InputWrapper
      error={
        fieldState.error?.message ||
        (errors[customErrorField]?.message as string)
      }
      style={{
        border: '1px solid var(--mantine-color-gray-2)',
        borderRadius: 'var(--mantine-radius-sm)',
      }}
      id="#editor-wrapper"
      {...wrapperProps}
    >
      <input name={restField.name} type="hidden" />
      {isLoading && <Skeleton visible height="100%" width="100%" />}
      {!isLoading && (
        <Editor
          beforeMount={(monaco) =>
            setupMonaco({
              monaco,
              setError: (err: string | null) => {
                if (!err) {
                  return clearErrors(customErrorField);
                }
                setError(customErrorField, {
                  type: 'custom',
                  message: err,
                });
              },
            })
          }
          defaultValue={controllerProps.defaultValue}
          value={value}
          onChange={fOnChange}
          loading={<Skeleton visible height="100%" width="100%" />}
          options={{ ...options, readOnly: restField.disabled }}
          defaultLanguage="json"
          {...(language && { language })}
        />
      )}
    </InputWrapper>
  );
};
