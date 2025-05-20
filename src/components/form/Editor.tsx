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
import { editor, Uri } from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { useCallback, useEffect } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { genControllerProps } from './util';

type SetupMonacoProps = {
  monaco: Monaco;
  cb: () => void;
};

const setupMonaco = (props: SetupMonacoProps) => {
  const { monaco, cb } = props;

  window.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
  };
  cb();
  loader.config({ monaco });
  return loader.init();
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
  const { t } = useTranslation();
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

  const showErrOnMarkers = useCallback(
    (resource: Uri) => {
      const markers = monaco?.editor.getModelMarkers({ resource });
      const marker = markers?.[0];
      if (!marker) return false;
      setError(customErrorField, {
        type: 'custom',
        message: marker.message,
      });
      return true;
    },
    [customErrorField, monaco?.editor, setError]
  );

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
          beforeMount={(monaco) => {
            setupMonaco({
              monaco,
              cb: () =>
                monaco?.editor.onDidChangeMarkers(([uri]) =>
                  showErrOnMarkers(uri)
                ),
            });
          }}
          defaultValue={controllerProps.defaultValue}
          value={value}
          onChange={fOnChange}
          loading={<Skeleton visible height="100%" width="100%" />}
          options={{ ...options, readOnly: restField.disabled }}
          onMount={(editor) => {
            editor.onDidChangeModelContent(() => {
              try {
                JSON.parse(editor.getValue());
              } catch {
                return setError(customErrorField, {
                  type: 'custom',
                  message: t('form.json.parseError'),
                });
              }
              const uri = editor.getModel()?.uri;
              if (uri && showErrOnMarkers(uri)) return;

              clearErrors(customErrorField);
            });
          }}
          defaultLanguage="json"
          {...(language && { language })}
        />
      )}
    </InputWrapper>
  );
};
