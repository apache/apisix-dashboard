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

import {
  ActionIcon,
  Box,
  Button,
  Fieldset,
  Group,
  TagsInput,
  Text,
} from '@mantine/core';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';

import type { FieldProps, JSONSchema } from '../types';
import { getFieldDescription, getFieldLabel, getSchemaType } from '../utils';
import { SchemaField } from './SchemaField';

export const ArrayField: React.FC<FieldProps> = ({
  schema,
  name,
  required,
  encryptFields,
  disabled,
}) => {
  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  const itemSchema = (schema.items && !Array.isArray(schema.items))
    ? schema.items
    : undefined;

  const itemType = itemSchema ? getSchemaType(itemSchema) : 'string';

  // For simple string/number arrays, use TagsInput
  if (itemType === 'string' && !itemSchema?.enum && !itemSchema?.properties) {
    return (
      <SimpleStringArray
        schema={schema}
        name={name}
        label={label}
        description={description}
        required={required}
        disabled={disabled}
      />
    );
  }

  // For object arrays, render repeatable fieldsets
  if (itemSchema && (itemType === 'object' || itemSchema.properties)) {
    return (
      <ObjectArrayField
        schema={schema}
        itemSchema={itemSchema}
        name={name}
        label={label}
        description={description}
        required={required}
        encryptFields={encryptFields}
        disabled={disabled}
      />
    );
  }

  // Fallback: simple tags input
  return (
    <SimpleStringArray
      schema={schema}
      name={name}
      label={label}
      description={description}
      required={required}
      disabled={disabled}
    />
  );
};

const SimpleStringArray: React.FC<{
  schema: JSONSchema;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}> = ({ schema, name, label, description, required, disabled }) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange, onBlur, ref },
  } = useController({
    name,
    control,
    defaultValue: schema.default ?? [],
  });

  return (
    <TagsInput
      label={label}
      description={description}
      required={required}
      disabled={disabled}
      ref={ref}
      onBlur={onBlur}
      value={Array.isArray(value) ? value.map(String) : []}
      onChange={(vals) => onChange(vals)}
      acceptValueOnBlur
      placeholder="Type and press Enter"
    />
  );
};

const ObjectArrayField: React.FC<{
  schema: JSONSchema;
  itemSchema: JSONSchema;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  encryptFields?: string[];
  disabled?: boolean;
}> = ({
  schema,
  itemSchema,
  name,
  label,
  description,
  required,
  encryptFields,
  disabled,
}) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const maxItems = schema.maxItems;
  const canAdd = !maxItems || fields.length < maxItems;

  return (
    <Fieldset legend={label} variant="filled">
      {description && (
        <Text size="xs" c="dimmed" mb="xs">
          {description}
        </Text>
      )}
      {required && fields.length === 0 && (
        <Text size="xs" c="red" mb="xs">
          At least one item is required
        </Text>
      )}
      {fields.map((field, index) => (
        <Box
          key={field.id}
          mb="sm"
          p="sm"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 'var(--mantine-radius-sm)',
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Item {index + 1}
            </Text>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={() => remove(index)}
              disabled={disabled}
              aria-label={`Remove item ${index + 1}`}
            >
              ✕
            </ActionIcon>
          </Group>
          {itemSchema.properties &&
            Object.entries(itemSchema.properties).map(([key, propSchema]) => (
              <Box key={key} mb="xs">
                <SchemaField
                  schema={propSchema}
                  name={`${name}.${index}.${key}`}
                  required={itemSchema.required?.includes(key)}
                  encryptFields={encryptFields}
                  disabled={disabled}
                />
              </Box>
            ))}
        </Box>
      ))}
      <Button
        variant="light"
        size="xs"
        onClick={() => append({})}
        disabled={disabled || !canAdd}
      >
        + Add Item
      </Button>
    </Fieldset>
  );
};
