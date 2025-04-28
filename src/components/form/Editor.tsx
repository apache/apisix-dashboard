import { InputWrapper, Skeleton, type InputWrapperProps } from '@mantine/core';
import { Editor, loader, useMonaco, type Monaco } from '@monaco-editor/react';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import {
  useController,
  useFormContext,
  useFormState,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';
import type { editor } from 'monaco-editor';
import { useEffect } from 'react';

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
          options={{ ...options, readOnly: restProps.disabled }}
          defaultLanguage="json"
          {...(language && { language })}
        />
      )}
    </InputWrapper>
  );
};
