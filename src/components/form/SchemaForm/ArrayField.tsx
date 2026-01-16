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
/* eslint-disable i18next/no-literal-string */
import { ActionIcon, Button, Fieldset, Group, Stack, Text } from '@mantine/core';
import type { Control, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import IconPlus from '~icons/material-symbols/add';
import IconTrash from '~icons/material-symbols/delete-outline';

import { SchemaField } from './SchemaField';
import type { JSONSchema7 } from './types';

export type ArrayFieldProps = {
    name: string;
    schema: JSONSchema7;
    control: Control<FieldValues>;
    required?: boolean;
};

/**
 * ArrayField - Renders a dynamic array of fields using useFieldArray
 *
 * Handles:
 * - Arrays of objects with Add/Remove functionality
 * - Nested object schemas within array items
 */
export const ArrayField = ({ name, schema, control, required: _required }: ArrayFieldProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const itemSchema = schema.items as JSONSchema7;

    // Generate default values for new items based on schema
    const getDefaultItem = (): Record<string, unknown> => {
        if (itemSchema.type !== 'object' || !itemSchema.properties) {
            return {};
        }

        const defaultItem: Record<string, unknown> = {};
        Object.entries(itemSchema.properties).forEach(([key, propSchema]) => {
            const prop = propSchema as JSONSchema7;
            if (prop.default !== undefined) {
                defaultItem[key] = prop.default;
            } else if (prop.type === 'string') {
                defaultItem[key] = '';
            } else if (prop.type === 'number' || prop.type === 'integer') {
                defaultItem[key] = 0;
            } else if (prop.type === 'boolean') {
                defaultItem[key] = false;
            }
        });
        return defaultItem;
    };

    const handleAdd = () => {
        append(getDefaultItem());
    };

    const formatLabel = (fieldName: string): string => {
        const name = fieldName.split('.').pop() || fieldName;
        return name
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Fieldset legend={schema.title || formatLabel(name)} mt="md">
            <Stack gap="md">
                {schema.description && (
                    <Text size="sm" c="dimmed">
                        {schema.description}
                    </Text>
                )}

                {fields.length === 0 && (
                    <Text size="sm" c="dimmed" fs="italic">
                        No items added yet. Click "Add Item" to begin.
                    </Text>
                )}

                {fields.map((field, index) => (
                    <Fieldset key={field.id} variant="filled">
                        <Group justify="space-between" mb="sm">
                            <Text size="sm" fw={500}>
                                Item {index + 1}
                            </Text>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => remove(index)}
                                aria-label={`Remove item ${index + 1}`}
                            >
                                <IconTrash />
                            </ActionIcon>
                        </Group>

                        <Stack gap="sm">
                            {itemSchema.properties &&
                                Object.entries(itemSchema.properties).map(
                                    ([key, propSchema]) => (
                                        <SchemaField
                                            key={`${name}.${index}.${key}`}
                                            name={`${name}.${index}.${key}`}
                                            schema={propSchema as JSONSchema7}
                                            control={control}
                                            required={itemSchema.required?.includes(key)}
                                        />
                                    )
                                )}
                        </Stack>
                    </Fieldset>
                ))}

                <Button
                    variant="light"
                    leftSection={<IconPlus />}
                    onClick={handleAdd}
                    size="sm"
                >
                    Add Item
                </Button>
            </Stack>
        </Fieldset>
    );
};
