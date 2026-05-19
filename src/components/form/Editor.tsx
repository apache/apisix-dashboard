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
import { Editor } from '@monaco-editor/react';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { monaco, setupMonacoEditor } from '@/utils/monaco';

import { genControllerProps } from './util';

setupMonacoEditor();

const options: monaco.editor.IStandaloneEditorConstructionOptions = {
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
  const { customSchema, language, isLoading, required, ...wrapperProps } =
    restProps;
  const { trigger, watch } = useFormContext();
  const monacoErrorRef = useRef<string | null>(null);
  const enhancedControllerProps = useMemo(() => {
    return {
      ...controllerProps,
      rules: {
        ...controllerProps.rules,
        validate: (value: string) => {
          if (value.trim().length === 0 && !required) {
            return true;
          }
          // Check JSON syntax
          try {
            JSON.parse(value);
          } catch {
            return t('form.json.parseError');
          }
          // Check Monaco markers
          if (monacoErrorRef.current) {
            return monacoErrorRef.current;
          }
          return true;
        },
      },
    };
  }, [controllerProps, required, t, monacoErrorRef]);

  const {
    field: { value: controlledValue, onChange: fOnChange, ...restField },
    fieldState,
  } = useController<T>(enhancedControllerProps);

  // useController returns undefined for disabled fields in react-hook-form.
  // useFormContext().watch() reads from both _formValues and _defaultValues,
  // making it reliable even when the form is disabled with shouldUnregister:true.
  const watchedValue = watch(controllerProps.name as string);
  // watchedValue may be a non-string (e.g. raw array) if the form store has
  // the pre-transform value. Normalize to a JSON string for Monaco.
  const normalizedWatchedValue = typeof watchedValue === 'string'
    ? watchedValue
    : watchedValue != null
      ? JSON.stringify(watchedValue, null, 2)
      : undefined;
  const value = restField.disabled ? normalizedWatchedValue ?? '' : controlledValue;

  const [internalLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const schemas = [];
    if (customSchema) {
      schemas.push({
        uri: 'https://apisix.apache.org',
        fileMatch: ['*'],
        schema: customSchema,
      });
    }
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas,
      trailingCommas: 'error',
      enableSchemaRequest: false,
    });

    setLoading(false);
  }, [customSchema]);

  return (
    <InputWrapper
      error={fieldState.error?.message}
      id="#editor-wrapper"
      required={required}
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
        wrapperProps={{
          className: clsx(
            'editor-wrapper',
            restField.disabled && 'editor-wrapper--disabled'
          ),
        }}
        defaultValue={controllerProps.defaultValue}
        value={value}
        onChange={fOnChange}
        onValidate={(markers) => {
          monacoErrorRef.current = markers?.[0]?.message || null;
          trigger(props.name);
        }}
        onMount={(editor) => {
          if (process.env.NODE_ENV !== 'production') {
            window.__monacoEditor__ = editor;
          }
        }}
        loading={
          <Skeleton
            data-testid="editor-loading"
            visible
            height="100%"
            width="100%"
          />
        }
        options={{ ...options, readOnly: restField.disabled }}
        defaultLanguage="json"
        {...(language && { language })}
      />
    </InputWrapper>
  );
};
