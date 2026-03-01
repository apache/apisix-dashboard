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

import { Box, Fieldset, SegmentedControl, Text } from '@mantine/core';
import { useState } from 'react';

import type { FieldProps } from '../types';
import { getFieldDescription, getFieldLabel, getOneOfLabel } from '../utils';
import { SchemaField } from './SchemaField';

export const AnyOfField: React.FC<FieldProps> = ({
  schema,
  name,
  required: _required,
  encryptFields,
  disabled,
}) => {
  const anyOfSchemas = schema.anyOf ?? [];
  if (anyOfSchemas.length === 0) return null;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  const options = anyOfSchemas.map((s, i) => ({
    value: String(i),
    label: getOneOfLabel(s, i),
  }));

  const selectedSchema = anyOfSchemas[selectedIndex];
  if (!selectedSchema) return null;

  return (
    <Fieldset legend={label} variant="filled">
      {description && (
        <Text size="xs" c="dimmed" mb="xs">
          {description}
        </Text>
      )}
      {anyOfSchemas.length > 1 && (
        <Box mb="sm">
          <Text size="sm" fw={500} mb={4}>
            Select format
          </Text>
          <SegmentedControl
            value={String(selectedIndex)}
            onChange={(val) => setSelectedIndex(Number(val))}
            data={options}
            disabled={disabled}
            fullWidth
            size="xs"
          />
        </Box>
      )}
      {selectedSchema.properties &&
        Object.entries(selectedSchema.properties).map(([key, propSchema]) => (
          <Box key={key} mb="sm">
            <SchemaField
              schema={propSchema}
              name={name ? `${name}.${key}` : key}
              required={selectedSchema.required?.includes(key)}
              encryptFields={encryptFields}
              disabled={disabled}
            />
          </Box>
        ))}
      {selectedSchema.type && !selectedSchema.properties && (
        <SchemaField
          schema={selectedSchema}
          name={name}
          encryptFields={encryptFields}
          disabled={disabled}
        />
      )}
    </Fieldset>
  );
};
