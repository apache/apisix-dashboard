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
import { ActionIcon, Button, Fieldset, Group, Stack, Text, TextInput } from '@mantine/core';
import { useFieldArray, useFormContext } from 'react-hook-form';

import IconPlus from '~icons/material-symbols/add';
import IconTrash from '~icons/material-symbols/delete-outline';

export type PatternPropertiesFieldProps = {
    name: string;
    label?: string;
    description?: string;
};

/**
 * PatternPropertiesField - Renders a dynamic key-value editor for patternProperties.
 *
 * In APISIX plugin schemas, patternProperties is used for arbitrary string maps
 * such as HTTP headers: { "^[a-zA-Z0-9-]+$": { "type": "string" } }
 *
 * This component stores data as [{ key, value }] internally.
 */
export const PatternPropertiesField = ({
    name,
    label,
    description,
}: PatternPropertiesFieldProps) => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    return (
        <Fieldset legend={label ?? name} mt="md">
            <Stack gap="sm">
                {description && (
                    <Text size="sm" c="dimmed">
                        {description}
                    </Text>
                )}

                {fields.length === 0 && (
                    <Text size="sm" c="dimmed" fs="italic">
                        No entries yet. Click "Add Pair" to begin.
                    </Text>
                )}

                {fields.map((field, index) => (
                    <Group key={field.id} gap="xs" align="flex-end">
                        <TextInput
                            label="Key"
                            placeholder="e.g. X-Custom-Header"
                            style={{ flex: 1 }}
                            {...register(`${name}.${index}.key`)}
                        />
                        <TextInput
                            label="Value"
                            placeholder="e.g. my-value"
                            style={{ flex: 1 }}
                            {...register(`${name}.${index}.value`)}
                        />
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            mb={4}
                            onClick={() => remove(index)}
                            aria-label={`Remove pair ${index + 1}`}
                        >
                            <IconTrash />
                        </ActionIcon>
                    </Group>
                ))}

                <Button
                    variant="light"
                    leftSection={<IconPlus />}
                    size="sm"
                    onClick={() => append({ key: '', value: '' })}
                >
                    Add Pair
                </Button>
            </Stack>
        </Fieldset>
    );
};
