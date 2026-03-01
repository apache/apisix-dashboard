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

import { Alert, Box, Button, Group, Stack } from '@mantine/core';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SchemaField } from './fields/SchemaField';
import type { JSONSchema, SchemaFormProps } from './types';
import { resolveDefaults } from './utils';
import {
  validateAgainstSchema,
  type ValidationError,
} from './validation';

export const SchemaForm: React.FC<SchemaFormProps> = ({
  schema,
  value,
  onChange,
  onSubmit,
  encryptFields,
  disabled,
  rootPath = '',
}) => {
  const defaults = resolveDefaults(schema);
  const initialValues = { ...defaults, ...value };
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const methods = useForm({
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  const handleChange = useCallback(
    (data: Record<string, unknown>) => {
      onChange?.(data);
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (data: Record<string, unknown>) => {
      // Run AJV validation against the full schema
      const errors = validateAgainstSchema(schema, data);
      setValidationErrors(errors);

      if (errors.length > 0) {
        // Map errors back to form fields
        for (const err of errors) {
          if (err.path) {
            methods.setError(err.path, {
              type: 'validate',
              message: err.message,
            });
          }
        }
        return;
      }

      onSubmit?.(data);
    },
    [schema, onSubmit, methods]
  );

  // Watch for changes and propagate
  if (onChange) {
    methods.watch((data) => {
      handleChange(data as Record<string, unknown>);
    });
  }

  if (!schema || !schema.properties) {
    return (
      <Alert color="yellow" title="No schema">
        No renderable schema properties found.
      </Alert>
    );
  }

  const requiredSet = new Set(schema.required ?? []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Stack gap="md">
          {Object.entries(schema.properties).map(([key, propSchema]) => (
            <Box key={key}>
              <SchemaField
                schema={propSchema}
                name={rootPath ? `${rootPath}.${key}` : key}
                required={requiredSet.has(key)}
                encryptFields={encryptFields ?? schema.encrypt_fields}
                disabled={disabled}
              />
            </Box>
          ))}

          <ConditionalTopLevel
            schema={schema}
            encryptFields={encryptFields ?? schema.encrypt_fields}
            disabled={disabled}
            rootPath={rootPath}
          />

          {validationErrors.length > 0 && (
            <Alert color="red" title="Validation Errors">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {validationErrors.map((err, i) => (
                  <li key={i}>
                    {err.path ? <strong>{err.path}:</strong> : null}{' '}
                    {err.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {onSubmit && (
            <Group justify="flex-end">
              <Button type="submit" disabled={disabled}>
                Submit
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </FormProvider>
  );
};

const ConditionalTopLevel: React.FC<{
  schema: JSONSchema;
  encryptFields?: string[];
  disabled?: boolean;
  rootPath: string;
}> = ({ schema, encryptFields, disabled, rootPath }) => {
  // Handle top-level oneOf (required-field alternatives)
  // These are typically just mode selectors and don't add extra properties
  // The actual rendering is handled by individual field components

  // Handle top-level if/then/else
  if (schema.if && (schema.then || schema.else)) {
    return (
      <SchemaField
        schema={{
          type: 'object',
          properties: schema.properties,
          if: schema.if,
          then: schema.then,
          else: schema.else,
        }}
        name={rootPath}
        encryptFields={encryptFields}
        disabled={disabled}
      />
    );
  }

  return null;
};
