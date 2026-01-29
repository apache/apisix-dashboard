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
import { Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ZodSchema } from 'zod';

import { FormItemEditor } from '@/components/form/Editor';
import { validateJSONSyntax } from '@/utils/json-transformer';

export type JSONEditorViewProps<T> = {
  /** The JSON string to display in the editor */
  value: string;
  /** Whether the editor is in read-only mode */
  readOnly: boolean;
  /** Callback when save button is clicked (unified state's save returns boolean) */
  onSave: () => Promise<boolean>;
  /** Callback when cancel button is clicked */
  onCancel?: () => void;
  /** Callback when JSON value changes (for unified state integration) */
  onChange?: (jsonString: string) => void;
  /** Optional Zod schema for validation */
  schema?: ZodSchema<T>;
  /** Whether save operation is in progress */
  isSaving?: boolean;
};

/**
 * JSONEditorView Component
 *
 * Provides a Monaco-based JSON editor for viewing and editing resource configurations.
 * Supports read-only mode, JSON syntax validation, and optional schema validation.
 */
export const JSONEditorView = <T,>(props: JSONEditorViewProps<T>) => {
  const {
    value,
    readOnly,
    onSave,
    onCancel,
    onChange,
    schema,
    isSaving = false,
  } = props;
  const { t } = useTranslation();

  const [validationError, setValidationError] = useState<string | null>(null);
  // Track if update came from external prop to prevent circular updates
  const isExternalUpdate = useRef(false);

  const form = useForm<{ json: string }>({
    defaultValues: { json: value },
    disabled: readOnly,
  });

  const { handleSubmit, setValue, watch } = form;
  const jsonValue = watch('json');

  // Update form when external value changes
  useEffect(() => {
    isExternalUpdate.current = true;
    setValue('json', value);
  }, [value, setValue]);

  // Report changes to unified state (only for internal edits)
  useEffect(() => {
    // Skip if this was triggered by external value update
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    if (!readOnly && onChange && jsonValue !== value) {
      onChange(jsonValue);
    }
  }, [jsonValue, onChange, readOnly, value]);

  // Validate JSON on change
  useEffect(() => {
    if (readOnly) {
      setValidationError(null);
      return;
    }

    const { isValid, error } = validateJSONSyntax(jsonValue);
    if (!isValid) {
      setValidationError(error || t('form.view.invalidJSON'));
      return;
    }

    // If syntax is valid, check schema if provided
    if (schema) {
      try {
        const parsed = JSON.parse(jsonValue);
        schema.parse(parsed);
        setValidationError(null);
      } catch (schemaError) {
        if (schemaError instanceof Error) {
          setValidationError(
            `${t('form.view.schemaValidationFailed')}: ${schemaError.message}`
          );
        } else {
          setValidationError(t('form.view.schemaValidationFailed'));
        }
      }
    } else {
      setValidationError(null);
    }
  }, [jsonValue, readOnly, schema, t]);

  const handleSaveClick = handleSubmit(async ({ json }) => {
    // Final validation before save
    const { isValid } = validateJSONSyntax(json);
    if (!isValid) {
      return;
    }

    if (schema) {
      try {
        const parsed = JSON.parse(json);
        schema.parse(parsed);
      } catch {
        return; // Validation error already shown in state
      }
    }

    // Call unified state's save (json is already in unified state via onChange)
    await onSave();
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSaveClick}>
        <Stack gap="md">
          {/* Validation Error Display */}
          {validationError && !readOnly && (
            <Text c="red" size="sm">
              {validationError}
            </Text>
          )}

          {/* Monaco JSON Editor */}
          <FormItemEditor
            name="json"
            h={600}
            language="json"
            required
          />

          {/* Action Buttons */}
          {!readOnly && (
            <Group justify="flex-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                {t('form.btn.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!!validationError || isSaving}
                loading={isSaving}
              >
                {t('form.btn.save')}
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </FormProvider>
  );
};
