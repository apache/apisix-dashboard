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
import { Fieldset, Stack } from '@mantine/core';
import type { Control, FieldValues } from 'react-hook-form';

import { FormItemNumberInput } from '../NumberInput';
import { FormItemSelect } from '../Select';
import { FormItemSwitch } from '../Switch';
import { FormItemTextArray } from '../TextArray';
import { FormItemTextInput } from '../TextInput';
import { ArrayField } from './ArrayField';
import type { JSONSchema7 } from './types';

export type SchemaFieldProps = {
    name: string;
    schema: JSONSchema7;
    control: Control<FieldValues>;
    required?: boolean;
};

/**
 * SchemaField - Maps a JSON Schema property to the appropriate form component
 *
 * Uses the existing dashboard form components:
 * - FormItemTextInput
 * - FormItemNumberInput
 * - FormItemSelect
 * - FormItemSwitch
 */
export const SchemaField = (
    { name, schema, control, required }: SchemaFieldProps
) => {
    // Handle nested objects recursively
    if (schema.type === 'object' && schema.properties) {
        return (
            <Fieldset legend={schema.title || name} mt="md">
                <Stack gap="sm">
                    {Object.entries(schema.properties).map(([key, propSchema]) => (
                        <SchemaField
                            key={`${name}.${key}`}
                            name={`${name}.${key}`}
                            schema={propSchema as JSONSchema7}
                            control={control}
                            required={schema.required?.includes(key)}
                        />
                    ))}
                </Stack>
            </Fieldset>
        );
    }

    // Handle arrays
    if (schema.type === 'array' && schema.items) {
        const itemSchema = schema.items as JSONSchema7;

        // Simple string/number arrays → TagsInput
        if (itemSchema.type === 'string' || itemSchema.type === 'number') {
            return (
                <FormItemTextArray
                    name={name}
                    control={control}
                    label={schema.title || formatLabel(name)}
                    description={schema.description}
                    placeholder={`Add ${formatLabel(name).toLowerCase()} and press Enter`}
                />
            );
        }

        // Object arrays → Use ArrayField with useFieldArray
        if (itemSchema.type === 'object') {
            return (
                <ArrayField
                    name={name}
                    schema={schema}
                    control={control}
                    required={required}
                />
            );
        }
    }

    // Handle enums → Select dropdown
    if (schema.enum) {
        return (
            <FormItemSelect
                name={name}
                control={control}
                label={schema.title || formatLabel(name)}
                description={schema.description}
                placeholder={`Select ${formatLabel(name).toLowerCase()}`}
                data={schema.enum.map((val) => ({
                    value: String(val),
                    label: String(val),
                }))}
                required={required}
                defaultValue={schema.default as string}
            />
        );
    }

    // Handle boolean → Switch
    if (schema.type === 'boolean') {
        return (
            <FormItemSwitch
                name={name}
                control={control}
                label={schema.title || formatLabel(name)}
                description={schema.description}
                defaultChecked={schema.default as boolean}
            />
        );
    }

    // Handle number/integer → NumberInput
    if (schema.type === 'number' || schema.type === 'integer') {
        return (
            <FormItemNumberInput
                name={name}
                control={control}
                label={schema.title || formatLabel(name)}
                description={schema.description}
                placeholder={
                    schema.default !== undefined
                        ? `Default: ${schema.default}`
                        : undefined
                }
                min={schema.minimum}
                max={schema.maximum}
                required={required}
                defaultValue={schema.default as number}
            />
        );
    }

    // Handle string → TextInput (default)
    return (
        <FormItemTextInput
            name={name}
            control={control}
            label={schema.title || formatLabel(name)}
            description={schema.description}
            placeholder={
                schema.default !== undefined ? `Default: ${schema.default}` : undefined
            }
            required={required}
            defaultValue={schema.default as string}
        />
    );
};

/**
 * Formats a field name into a human-readable label
 * e.g., "oauth_client_id" → "OAuth Client ID"
 */
function formatLabel(name: string): string {
    // Get just the field name if it's a path
    const fieldName = name.split('.').pop() || name;

    return fieldName
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
