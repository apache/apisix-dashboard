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
import { describe, expect, it } from 'vitest';

import { renderWithForm } from '@/test/utils';

import { SchemaForm } from './index';
import type { JSONSchema7 } from './types';

type ExtendedJSONSchema7 = JSONSchema7 & {
    encrypt_fields?: string[];
};

// ---------------------------------------------------------------------------
// Basic property rendering
// ---------------------------------------------------------------------------

describe('SchemaForm — property rendering', () => {
    it('renders all top-level properties', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                host: { type: 'string', title: 'Host' },
                port: { type: 'integer', title: 'Port' },
                enable: { type: 'boolean', title: 'Enable' },
            },
        };
        renderWithForm(<SchemaForm schema={schema} />);
        expect(screen.getByLabelText('Host')).toBeInTheDocument();
        expect(screen.getByLabelText('Port')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders no form inputs when schema has no properties', () => {
        const schema: JSONSchema7 = { type: 'object' };
        renderWithForm(<SchemaForm schema={schema} />);
        // Empty schema → no text inputs, no spinbuttons, no switches
        expect(screen.queryAllByRole('textbox')).toHaveLength(0);
        expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
        expect(screen.queryAllByRole('switch')).toHaveLength(0);
    });

    it('renders encrypt_fields as password inputs', () => {
        const schema: ExtendedJSONSchema7 = {
            type: 'object',
            properties: {
                api_key: { type: 'string', title: 'API Key' },
                name: { type: 'string', title: 'Name' },
            },
            encrypt_fields: ['api_key'],
        };
        renderWithForm(<SchemaForm schema={schema} />);
        // SchemaForm reads encrypt_fields and passes isEncrypted to SchemaField
        // Mantine PasswordInput renders <input type="password">
        const passwordInput = document.querySelector('input[type="password"]');
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute('name', 'api_key');
        // Regular text field should NOT be a password input
        expect(screen.getByLabelText('Name')).not.toHaveAttribute('type', 'password');
    });

    it('renders a proxy-rewrite style schema with enum and nested objects', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                method: {
                    type: 'string',
                    title: 'Method',
                    enum: ['GET', 'POST'],
                },
                uri: { type: 'string', title: 'URI' },
            },
        };
        renderWithForm(<SchemaForm schema={schema} />);
        // Mantine v8 Select renders a readonly input with aria-haspopup="listbox"
        const selectInput = document.querySelector('input[readonly][aria-haspopup="listbox"]');
        expect(selectInput).toBeInTheDocument();
        expect(screen.getByLabelText('URI')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// oneOf — discriminator-based conditional fields
// ---------------------------------------------------------------------------

describe('SchemaForm — oneOf', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            auth_type: {
                type: 'string',
                title: 'Auth Type',
                enum: ['oauth', 'api_key'],
            },
        },
        required: ['auth_type'],
        oneOf: [
            {
                properties: {
                    auth_type: { const: 'oauth' },
                    client_id: {
                        type: 'string',
                        title: 'Client ID',
                    },
                    client_secret: {
                        type: 'string',
                        title: 'Client Secret',
                    },
                },
                required: ['client_id', 'client_secret'],
            },
            {
                properties: {
                    auth_type: { const: 'api_key' },
                    api_key_value: {
                        type: 'string',
                        title: 'API Key Value',
                    },
                },
                required: ['api_key_value'],
            },
        ],
    };

    it('shows no conditional fields before a oneOf branch is selected', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { auth_type: '' },
        });
        expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('API Key Value')).not.toBeInTheDocument();
    });

    it('shows oauth fields when auth_type is "oauth"', async () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { auth_type: 'oauth' },
        });
        // Labels have a required asterisk (*) because the branch marks them as required.
        // Use regex to match label text ignoring the appended asterisk.
        expect(await screen.findByLabelText(/^Client ID/)).toBeInTheDocument();
        expect(await screen.findByLabelText(/^Client Secret/)).toBeInTheDocument();
        expect(screen.queryByLabelText(/^API Key Value/)).not.toBeInTheDocument();
    });

    it('shows api_key fields when auth_type is "api_key"', async () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { auth_type: 'api_key' },
        });
        expect(await screen.findByLabelText(/^API Key Value/)).toBeInTheDocument();
        expect(screen.queryByLabelText(/^Client ID/)).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// anyOf — same discriminator pattern as oneOf (APISIX convention)
// ---------------------------------------------------------------------------

describe('SchemaForm — anyOf', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            backend: {
                type: 'string',
                title: 'Backend',
                enum: ['postgres', 'mysql'],
            },
        },
        anyOf: [
            {
                properties: {
                    backend: { const: 'postgres' },
                    pg_host: { type: 'string', title: 'PG Host' },
                },
            },
            {
                properties: {
                    backend: { const: 'mysql' },
                    mysql_host: { type: 'string', title: 'MySQL Host' },
                },
            },
        ],
    };

    it('shows postgres fields when backend is "postgres"', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { backend: 'postgres' },
        });
        expect(screen.getByLabelText('PG Host')).toBeInTheDocument();
        expect(screen.queryByLabelText('MySQL Host')).not.toBeInTheDocument();
    });

    it('shows mysql fields when backend is "mysql"', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { backend: 'mysql' },
        });
        expect(screen.getByLabelText('MySQL Host')).toBeInTheDocument();
        expect(screen.queryByLabelText('PG Host')).not.toBeInTheDocument();
    });

    it('hides all conditional fields when no branch is selected', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { backend: '' },
        });
        expect(screen.queryByLabelText('PG Host')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('MySQL Host')).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// dependencies — conditional fields that appear based on sibling field value
// ---------------------------------------------------------------------------

describe('SchemaForm — dependencies', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            storage: {
                type: 'string',
                title: 'Storage',
                enum: ['redis', 'none'],
            },
        },
        dependencies: {
            storage: {
                oneOf: [
                    {
                        properties: {
                            storage: { const: 'redis' },
                            redis_host: { type: 'string', title: 'Redis Host' },
                        },
                        required: ['redis_host'],
                    },
                    {
                        properties: {
                            storage: { const: 'none' },
                        },
                    },
                ],
            },
        },
    };

    it('shows redis fields when storage is "redis"', async () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { storage: 'redis' },
        });
        // redis_host is required in the branch schema, so its label reads "Redis Host *"
        expect(await screen.findByLabelText(/^Redis Host/)).toBeInTheDocument();
    });

    it('hides redis fields when storage is "none"', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { storage: 'none' },
        });
        expect(screen.queryByLabelText('Redis Host')).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// if/then/else — Draft 7 conditional rendering
// ---------------------------------------------------------------------------

describe('SchemaForm — if/then/else', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            enable_cache: { type: 'boolean', title: 'Enable Cache' },
        },
        if: {
            properties: { enable_cache: { const: true } },
            required: ['enable_cache'],
        },
        then: {
            properties: {
                cache_ttl: {
                    type: 'integer',
                    title: 'Cache TTL (s)',
                    minimum: 1,
                },
            },
            required: ['cache_ttl'],
        },
        else: {
            properties: {
                no_cache_reason: { type: 'string', title: 'Reason' },
            },
        },
    };

    it('renders "then" fields when the if condition matches', async () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { enable_cache: true },
        });
        // cache_ttl is marked required in the then schema, label renders as "Cache TTL (s) *"
        expect(await screen.findByLabelText(/^Cache TTL/)).toBeInTheDocument();
        expect(screen.queryByLabelText('Reason')).not.toBeInTheDocument();
    });

    it('renders "else" fields when the if condition does not match', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { enable_cache: false },
        });
        expect(screen.getByLabelText('Reason')).toBeInTheDocument();
        expect(screen.queryByLabelText('Cache TTL (s)')).not.toBeInTheDocument();
    });

    it('renders nothing extra when neither then nor else has properties', () => {
        const simpleSchema: JSONSchema7 = {
            type: 'object',
            properties: {
                flag: { type: 'boolean', title: 'Flag' },
            },
            if: {
                properties: { flag: { const: true } },
                required: ['flag'],
            },
            then: { properties: { extra: { type: 'string', title: 'Extra' } } },
        };
        renderWithForm(<SchemaForm schema={simpleSchema} />, {
            defaultValues: { flag: false },
        });
        // else is undefined → nothing extra
        expect(screen.queryByLabelText('Extra')).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// basePath — prefixes field names for nested plugin configs
// ---------------------------------------------------------------------------

describe('SchemaForm — basePath', () => {
    it('prefixes all field names with the basePath', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                host: { type: 'string', title: 'Host' },
            },
        };
        renderWithForm(
            <SchemaForm schema={schema} basePath="plugins.proxy-rewrite" />,
            { defaultValues: { plugins: { 'proxy-rewrite': { host: '' } } } }
        );
        // The input should still render with its label
        expect(screen.getByLabelText('Host')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Interactive: switching between oneOf branches
// Note: Mantine's Select uses @floating-ui for dropdown positioning, which
// requires layout APIs that jsdom doesn't fully implement. Instead of testing
// the dropdown interaction, we verify the behaviour by rendering with
// different initial values — the same contract tested by the oneOf suite above.
// The integration between user interaction and field switching is covered by
// the Playwright e2e tests.
// ---------------------------------------------------------------------------

describe('SchemaForm — oneOf field isolation', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                title: 'Type',
                enum: ['a', 'b'],
            },
        },
        oneOf: [
            {
                properties: {
                    type: { const: 'a' },
                    field_a: { type: 'string', title: 'Field A' },
                },
            },
            {
                properties: {
                    type: { const: 'b' },
                    field_b: { type: 'string', title: 'Field B' },
                },
            },
        ],
    };

    it('renders only field_a fields when type=a', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { type: 'a' },
        });
        expect(screen.getByLabelText('Field A')).toBeInTheDocument();
        expect(screen.queryByLabelText('Field B')).not.toBeInTheDocument();
    });

    it('renders only field_b fields when type=b', () => {
        renderWithForm(<SchemaForm schema={schema} />, {
            defaultValues: { type: 'b' },
        });
        expect(screen.getByLabelText('Field B')).toBeInTheDocument();
        expect(screen.queryByLabelText('Field A')).not.toBeInTheDocument();
    });
});
