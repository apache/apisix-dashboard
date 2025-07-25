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
import { InputWrapper, type InputWrapperProps, Skeleton } from '@mantine/core';
import { Editor, loader, type Monaco, useMonaco } from '@monaco-editor/react';
import { editor, Uri } from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { genControllerProps } from './util';

type SetupMonacoProps = {
  monaco: Monaco;
};

const setupMonaco = ({ monaco }: SetupMonacoProps) => {
  window.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      return new editorWorker();
    },
  };
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

const FormItemEditorComponent = <T extends FieldValues>(
  props: FormItemEditorProps<T>
) => {
  const { t } = useTranslation();
  const { controllerProps, restProps } = genControllerProps(props, '');
  const { customSchema, language, isLoading, ...wrapperProps } = restProps;
  const { setError, clearErrors } = useFormContext<{
    [name: string]: object;
  }>();

  const {
    field: { value, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(controllerProps);

  const monaco = useMonaco();
  const [internalLoading, setLoading] = useState(false);

  const showErrOnMarkers = useCallback(
    (resource: Uri) => {
      const markers = monaco?.editor.getModelMarkers({ resource });
      const marker = markers?.[0];
      if (!marker) return false;
      setError(props.name, {
        type: 'custom',
        message: marker.message,
      });
      return true;
    },
    [props.name, monaco?.editor, setError]
  );

  useEffect(() => {
    if (!monaco || !customSchema) return;
    setLoading(true);
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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
    // when markers change, show error
    monaco.editor.onDidChangeMarkers(([uri]) => {
      showErrOnMarkers(uri);
    });

    setLoading(false);
  }, [customSchema, monaco, showErrOnMarkers]);

  return (
    <InputWrapper
      error={fieldState.error?.message}
      id="#editor-wrapper"
      {...wrapperProps}
    >
      <input name={restField.name} type="hidden" />
      {(isLoading || internalLoading) && (
        <Skeleton
          style={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
          }}
          data-testid="editor-loading"
          visible
          height="100%"
          width="100%"
        />
      )}
      <Editor
        wrapperProps={{ className: 'editor-wrapper' }}
        beforeMount={(monaco) => setupMonaco({ monaco })}
        defaultValue={controllerProps.defaultValue}
        value={value}
        onChange={fOnChange}
        loading={
          <Skeleton
            data-testid="editor-loading"
            visible
            height="100%"
            width="100%"
          />
        }
        options={{ ...options, readOnly: restField.disabled }}
        onMount={(editor) => {
          // this only check json validity, will clear error when json is valid and no markers
          editor.onDidChangeModelContent(() => {
            try {
              const model = editor.getModel()!;
              JSON.parse(model.getValue());
              clearErrors(props.name);
            } catch {
              return setError(props.name, {
                type: 'custom',
                message: t('form.json.parseError'),
              });
            }
          });
        }}
        defaultLanguage="json"
        {...(language && { language })}
      />
    </InputWrapper>
  );
};

export const FormItemEditor = React.memo(FormItemEditorComponent);
