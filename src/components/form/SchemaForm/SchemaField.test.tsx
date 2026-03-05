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
import { screen } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { renderWithForm } from '@/test/utils';

import { SchemaField } from './SchemaField';
import type { JSONSchema7 } from './types';

/**
 * Adapter: reads `control` from FormContext and passes it to SchemaField.
 * SchemaField requires `control` as a prop; this lets us test it inside
 * `renderWithForm` without manually threading the ref.
 */
const FieldAdapter = ({
    schema,
    name,
    isEncrypted,
    required,
}: {
    schema: JSONSchema7;
    name: string;
    isEncrypted?: boolean;
    required?: boolean;
}) => {
    const { control } = useFormContext();
    return (
        <SchemaField
            name={name}
            schema={schema}
            control={control}
            isEncrypted={isEncrypted}
            required={required}
        />
    );
};

function renderField(
    schema: JSONSchema7,
    name = 'field',
    props: { required?: boolean; isEncrypted?: boolean } = {}
) {
    return renderWithForm(<FieldAdapter schema={schema} name={name} {...props} />);
}

// ---------------------------------------------------------------------------
// Basic scalar types
// ---------------------------------------------------------------------------

describe('SchemaField — scalar types', () => {
    it('renders a text input for string schema', () => {
        renderField({ type: 'string', title: 'API Host' }, 'host');
        expect(screen.getByLabelText('API Host')).toBeInTheDocument();
    });

    it('renders a number input for integer schema', () => {
        renderField({ type: 'integer', title: 'Port', minimum: 1, maximum: 65535 }, 'port');
        const input = screen.getByLabelText('Port');
        expect(input).toBeInTheDocument();
        // Mantine v8 NumberInput renders a text input with inputmode="decimal"
        expect(input).toHaveAttribute('inputmode', 'decimal');
    });

    it('renders a number input for number schema', () => {
        renderField({ type: 'number', title: 'Timeout (s)' }, 'timeout');
        const input = screen.getByLabelText('Timeout (s)');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('inputmode', 'decimal');
    });

    it('renders a switch for boolean schema', () => {
        renderField({ type: 'boolean', title: 'Enable Logging' }, 'enable_logging');
        expect(screen.getByRole('switch')).toBeInTheDocument();
        expect(screen.getByText('Enable Logging')).toBeInTheDocument();
    });

    it('renders a password input for encrypted fields', () => {
        renderField(
            { type: 'string', title: 'Secret Key' },
            'secret_key',
            { isEncrypted: true }
        );
        // PasswordInput renders <input type="password">
         
        const input = document.querySelector('input[type="password"]')!;
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'password');
    });
});

// ---------------------------------------------------------------------------
// Enum type
// ---------------------------------------------------------------------------

describe('SchemaField — enum', () => {
    it('renders a select (combobox) for enum schema', () => {
        renderField(
            {
                type: 'string',
                title: 'HTTP Method',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
            },
            'method'
        );
        expect(screen.getByText('HTTP Method')).toBeInTheDocument();
        // Mantine v8 Select renders a readonly input with aria-haspopup="listbox"
        const input = document.querySelector('input[readonly][aria-haspopup="listbox"]');
        expect(input).toBeInTheDocument();
    });

    it('includes all enum values as options in the ARIA listbox', () => {
        renderField(
            {
                type: 'string',
                title: 'Storage',
                enum: ['redis', 'memcached', 'none'],
            },
            'storage'
        );
        // Mantine renders options in the DOM at all times (dropdown hidden via CSS)
        // Use hidden:true to find elements inside display:none containers
        expect(screen.getByRole('option', { name: 'redis', hidden: true })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'memcached', hidden: true })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'none', hidden: true })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// String array (TagsInput)
// ---------------------------------------------------------------------------

describe('SchemaField — string array', () => {
    it('renders a tags input for array-of-strings schema', () => {
        renderField(
            {
                type: 'array',
                title: 'Allowed IPs',
                items: { type: 'string' },
            },
            'allowed_ips'
        );
        expect(screen.getByText('Allowed IPs')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Object type (nested Fieldset)
// ---------------------------------------------------------------------------

describe('SchemaField — nested object', () => {
    it('renders a fieldset for object schema with nested fields', () => {
        renderField(
            {
                type: 'object',
                title: 'Redis Config',
                properties: {
                    host: { type: 'string', title: 'Redis Host' },
                    port: { type: 'integer', title: 'Redis Port' },
                },
            },
            'redis'
        );
        // Fieldset legend
        expect(screen.getByText('Redis Config')).toBeInTheDocument();
        // Nested inputs
        expect(screen.getByLabelText('Redis Host')).toBeInTheDocument();
        expect(screen.getByLabelText('Redis Port')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Array of objects (ArrayField)
// ---------------------------------------------------------------------------

describe('SchemaField — object array', () => {
    it('renders an "Add Item" button for array-of-objects schema', () => {
        renderField(
            {
                type: 'array',
                title: 'Custom Headers',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', title: 'Header Name' },
                        value: { type: 'string', title: 'Header Value' },
                    },
                    required: ['name', 'value'],
                },
            },
            'custom_headers'
        );
        expect(screen.getByText('Add Item')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Label auto-formatting (when schema.title is absent)
// ---------------------------------------------------------------------------

describe('SchemaField — label formatting', () => {
    it('formats snake_case field names into Title Case labels', () => {
        renderField({ type: 'string' }, 'oauth_client_id');
        // formatLabel('oauth_client_id') capitalises each underscore-separated word
        expect(screen.getByText('Oauth Client Id')).toBeInTheDocument();
    });
});


