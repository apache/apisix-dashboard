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

import { Box, Fieldset, Text } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';

import type { FieldProps, JSONSchema } from '../types';
import {
  evaluateIfCondition,
  getFieldDescription,
  getFieldLabel,
  mergeSchemas,
} from '../utils';
import { SchemaField } from './SchemaField';

export const ObjectField: React.FC<FieldProps> = ({
  schema,
  name,
  required: _required,
  encryptFields,
  disabled,
}) => {
  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  if (!schema.properties && !schema.patternProperties) {
    return null;
  }

  return (
    <Fieldset legend={label} variant="filled">
      {description && (
        <Text size="xs" c="dimmed" mb="xs">
          {description}
        </Text>
      )}
      <ObjectProperties
        schema={schema}
        name={name}
        encryptFields={encryptFields}
        disabled={disabled}
      />
      <ConditionalProperties
        schema={schema}
        name={name}
        encryptFields={encryptFields}
        disabled={disabled}
      />
      <DependencyProperties
        schema={schema}
        name={name}
        encryptFields={encryptFields}
        disabled={disabled}
      />
    </Fieldset>
  );
};

const ObjectProperties: React.FC<{
  schema: JSONSchema;
  name: string;
  encryptFields?: string[];
  disabled?: boolean;
}> = ({ schema, name, encryptFields, disabled }) => {
  if (!schema.properties) return null;
  const requiredSet = new Set(schema.required ?? []);

  return (
    <>
      {Object.entries(schema.properties).map(([key, propSchema]) => (
        <Box key={key} mb="sm">
          <SchemaField
            schema={propSchema}
            name={name ? `${name}.${key}` : key}
            required={requiredSet.has(key)}
            encryptFields={encryptFields}
            disabled={disabled}
          />
        </Box>
      ))}
    </>
  );
};

const ConditionalProperties: React.FC<{
  schema: JSONSchema;
  name: string;
  encryptFields?: string[];
  disabled?: boolean;
}> = ({ schema, name, encryptFields, disabled }) => {
  const { control } = useFormContext();
  const watchedValues = useWatch({ control, name: name || '' });

  if (!schema.if || (!schema.then && !schema.else)) return null;

  const data =
    typeof watchedValues === 'object' && watchedValues !== null
      ? (watchedValues as Record<string, unknown>)
      : {};
  const branch = evaluateIfCondition(schema, data);

  const branchSchema =
    branch === 'then' ? schema.then : branch === 'else' ? schema.else : null;

  if (!branchSchema) return null;

  // If the branch has nested if/then/else, handle recursively
  const effectiveSchema = mergeSchemas(
    { type: 'object', properties: {} },
    branchSchema
  );

  return (
    <>
      {effectiveSchema.properties &&
        Object.entries(effectiveSchema.properties).map(([key, propSchema]) => {
          // Skip if this property is already rendered from the base schema
          if (schema.properties?.[key]) return null;
          return (
            <Box key={`cond-${key}`} mb="sm">
              <SchemaField
                schema={propSchema}
                name={name ? `${name}.${key}` : key}
                required={effectiveSchema.required?.includes(key)}
                encryptFields={encryptFields}
                disabled={disabled}
              />
            </Box>
          );
        })}
      {branchSchema.if && (
        <ConditionalProperties
          schema={branchSchema}
          name={name}
          encryptFields={encryptFields}
          disabled={disabled}
        />
      )}
    </>
  );
};

const DependencyProperties: React.FC<{
  schema: JSONSchema;
  name: string;
  encryptFields?: string[];
  disabled?: boolean;
}> = ({ schema, name, encryptFields, disabled }) => {
  const { control } = useFormContext();
  const watchedValues = useWatch({ control, name: name || '' });

  if (!schema.dependencies) return null;

  const data =
    typeof watchedValues === 'object' && watchedValues !== null
      ? (watchedValues as Record<string, unknown>)
      : {};

  const extraFields: React.ReactNode[] = [];

  for (const [depKey, depSchema] of Object.entries(schema.dependencies)) {
    const depValue = data[depKey];
    const isPresent =
      depValue !== undefined && depValue !== null && depValue !== '';

    if (!isPresent) continue;

    if (Array.isArray(depSchema)) {
      // Simple dependency: if depKey is present, these fields are required
      // This is handled by validation, no extra UI needed
      continue;
    }

    // Schema dependency with oneOf: find matching branch
    if (depSchema.oneOf) {
      for (const branch of depSchema.oneOf) {
        if (branch.properties) {
          let matches = true;
          for (const [propKey, propSchema] of Object.entries(
            branch.properties
          )) {
            if (propSchema.enum && !propSchema.enum.includes(data[propKey])) {
              matches = false;
              break;
            }
          }
          if (matches) {
            // Render additional required fields from this branch
            const branchRequired = new Set(branch.required ?? []);
            for (const [propKey, propSchema] of Object.entries(
              branch.properties
            )) {
              if (schema.properties?.[propKey]) continue;
              extraFields.push(
                <Box key={`dep-${depKey}-${propKey}`} mb="sm">
                  <SchemaField
                    schema={propSchema}
                    name={name ? `${name}.${propKey}` : propKey}
                    required={branchRequired.has(propKey)}
                    encryptFields={encryptFields}
                    disabled={disabled}
                  />
                </Box>
              );
            }
            break;
          }
        }
      }
    }

    // Schema dependency with properties
    if (depSchema.properties) {
      for (const [propKey, propSchema] of Object.entries(
        depSchema.properties
      )) {
        if (schema.properties?.[propKey]) continue;
        const depRequired = new Set(
          (depSchema as JSONSchema).required ?? []
        );
        extraFields.push(
          <Box key={`dep-${depKey}-${propKey}`} mb="sm">
            <SchemaField
              schema={propSchema}
              name={name ? `${name}.${propKey}` : propKey}
              required={depRequired.has(propKey)}
              encryptFields={encryptFields}
              disabled={disabled}
            />
          </Box>
        );
      }
    }
  }

  return <>{extraFields}</>;
};
