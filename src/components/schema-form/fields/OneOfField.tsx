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
import { useFormContext, useWatch } from 'react-hook-form';

import type { FieldProps } from '../types';
import {
  getFieldDescription,
  getFieldLabel,
  getOneOfLabel,
  getOneOfMatchIndex,
} from '../utils';
import { SchemaField } from './SchemaField';

export const OneOfField: React.FC<FieldProps> = ({
  schema,
  name,
  required: _required,
  encryptFields,
  disabled,
}) => {
  const { control } = useFormContext();
  const watchedValues = useWatch({ control, name: name || '' });
  const data =
    typeof watchedValues === 'object' && watchedValues !== null
      ? (watchedValues as Record<string, unknown>)
      : {};

  const oneOfSchemas = schema.oneOf ?? [];
  if (oneOfSchemas.length === 0) return null;

  const detectedIndex = getOneOfMatchIndex(oneOfSchemas, data);
  const [selectedIndex, setSelectedIndex] = useState(detectedIndex);

  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  const options = oneOfSchemas.map((s, i) => ({
    value: String(i),
    label: getOneOfLabel(s, i),
  }));

  const selectedSchema = oneOfSchemas[selectedIndex];
  if (!selectedSchema) return null;

  // If oneOf schemas only have `required` fields (no extra properties),
  // they act as "required field alternatives" — just render a mode selector
  const hasExtraProperties = oneOfSchemas.some(
    (s) => s.properties && Object.keys(s.properties).length > 0
  );

  return (
    <Fieldset legend={label} variant="filled">
      {description && (
        <Text size="xs" c="dimmed" mb="xs">
          {description}
        </Text>
      )}
      {oneOfSchemas.length > 1 && (
        <Box mb="sm">
          <Text size="sm" fw={500} mb={4}>
            Select configuration mode
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
      {hasExtraProperties && selectedSchema.properties && (
        <>
          {Object.entries(selectedSchema.properties).map(
            ([key, propSchema]) => (
              <Box key={key} mb="sm">
                <SchemaField
                  schema={propSchema}
                  name={name ? `${name}.${key}` : key}
                  required={selectedSchema.required?.includes(key)}
                  encryptFields={encryptFields}
                  disabled={disabled}
                />
              </Box>
            )
          )}
        </>
      )}
    </Fieldset>
  );
};
