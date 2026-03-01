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
  Button,
  Fieldset,
  Group,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import type { FieldProps } from '../types';
import { getFieldDescription, getFieldLabel } from '../utils';

export const PatternPropertiesField: React.FC<FieldProps> = ({
  schema,
  name,
  required: _required,
  disabled,
}) => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    defaultValue: schema.default ?? {},
  });

  const label = getFieldLabel(name, schema);
  const description = getFieldDescription(schema);

  const currentObj = (typeof value === 'object' && value !== null ? value : {}) as Record<
    string,
    string
  >;
  const entries = Object.entries(currentObj);

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addEntry = () => {
    if (!newKey.trim()) return;
    onChange({ ...currentObj, [newKey.trim()]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const removeEntry = (key: string) => {
    const updated = { ...currentObj };
    delete updated[key];
    onChange(updated);
  };

  const updateValue = (key: string, val: string) => {
    onChange({ ...currentObj, [key]: val });
  };

  return (
    <Fieldset legend={label} variant="filled">
      {description && (
        <Text size="xs" c="dimmed" mb="xs">
          {description}
        </Text>
      )}
      {entries.map(([key, val]) => (
        <Group key={key} mb="xs" gap="xs" align="flex-end">
          <TextInput
            value={key}
            disabled
            label="Key"
            size="xs"
            style={{ flex: 1 }}
          />
          <TextInput
            value={String(val)}
            onChange={(e) => updateValue(key, e.currentTarget.value)}
            label="Value"
            size="xs"
            disabled={disabled}
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => removeEntry(key)}
            disabled={disabled}
            aria-label={`Remove ${key}`}
          >
            ✕
          </ActionIcon>
        </Group>
      ))}
      <Group gap="xs" mt="xs" align="flex-end">
        <TextInput
          value={newKey}
          onChange={(e) => setNewKey(e.currentTarget.value)}
          placeholder="Key"
          size="xs"
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <TextInput
          value={newValue}
          onChange={(e) => setNewValue(e.currentTarget.value)}
          placeholder="Value"
          size="xs"
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <Button
          variant="light"
          size="xs"
          onClick={addEntry}
          disabled={disabled || !newKey.trim()}
        >
          + Add
        </Button>
      </Group>
    </Fieldset>
  );
};
