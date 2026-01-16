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
/* eslint-disable i18next/no-literal-string, i18n/no-text-as-attribute */
import {
    Alert,
    Button,
    Card,
    Code,
    Container,
    Grid,
    Group,
    Stack,
    Tabs,
    Text,
    Title,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';

import { createSchemaResolver, SchemaForm } from '@/components/form/SchemaForm';
import type { JSONSchema7 } from '@/components/form/SchemaForm/types';

/**
 * Demo schema showing oneOf and dependencies support
 * This mimics a real APISIX plugin configuration
 */
const demoSchema: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Sample APISIX Plugin Configuration',
    description: 'Demo schema showing oneOf and dependencies support',
    type: 'object',
    properties: {
        auth_type: {
            type: 'string',
            title: 'Authentication Type',
            enum: ['oauth', 'api_key'],
            description: 'Choose authentication method',
        },
        storage_type: {
            type: 'string',
            title: 'Storage Type',
            enum: ['redis', 'memcached', 'none'],
            default: 'none',
            description: 'Backend storage type',
        },
        rate_limit: {
            type: 'integer',
            title: 'Rate Limit',
            minimum: 1,
            maximum: 10000,
            default: 100,
            description: 'Requests per second',
        },
        enable_logging: {
            type: 'boolean',
            title: 'Enable Logging',
            default: false,
            description: 'Enable request logging',
        },
        // Array of strings (like proxy-rewrite regex_uri)
        regex_uri: {
            type: 'array',
            title: 'Regex URI Patterns',
            description: 'Regex patterns for URI rewriting (pairs of pattern and replacement)',
            items: {
                type: 'string',
            },
            minItems: 2,
        },
        // Array of strings (like headers.remove)
        remove_headers: {
            type: 'array',
            title: 'Headers to Remove',
            description: 'List of header names to remove from request',
            items: {
                type: 'string',
            },
        },
        // Array of objects (custom headers to add)
        custom_headers: {
            type: 'array',
            title: 'Custom Headers',
            description: 'Custom headers to add to the request',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        title: 'Header Name',
                        description: 'Name of the header',
                    },
                    value: {
                        type: 'string',
                        title: 'Header Value',
                        description: 'Value of the header',
                    },
                    overwrite: {
                        type: 'boolean',
                        title: 'Overwrite',
                        description: 'Overwrite if header exists',
                        default: false,
                    },
                },
                required: ['name', 'value'],
            },
        },
    },
    required: ['auth_type'],
    oneOf: [
        {
            properties: {
                auth_type: { const: 'oauth' },
                oauth_client_id: {
                    type: 'string',
                    title: 'OAuth Client ID',
                    minLength: 1,
                    description: 'OAuth Client ID',
                },
                oauth_client_secret: {
                    type: 'string',
                    title: 'OAuth Client Secret',
                    minLength: 1,
                    description: 'OAuth Client Secret',
                },
            },
            required: ['oauth_client_id', 'oauth_client_secret'],
        },
        {
            properties: {
                auth_type: { const: 'api_key' },
                api_key_header: {
                    type: 'string',
                    title: 'API Key Header',
                    default: 'X-API-Key',
                    description: 'Header name for API key',
                },
                api_key_value: {
                    type: 'string',
                    title: 'API Key Value',
                    minLength: 8,
                    description: 'API Key value (min 8 characters)',
                },
            },
            required: ['api_key_value'],
        },
    ],
    dependencies: {
        storage_type: {
            oneOf: [
                {
                    properties: {
                        storage_type: { const: 'redis' },
                        redis_host: {
                            type: 'string',
                            title: 'Redis Host',
                            description: 'Redis server hostname',
                        },
                        redis_port: {
                            type: 'integer',
                            title: 'Redis Port',
                            minimum: 1,
                            maximum: 65535,
                            default: 6379,
                            description: 'Redis server port',
                        },
                    },
                    required: ['redis_host'],
                },
                {
                    properties: {
                        storage_type: { const: 'memcached' },
                        memcached_host: {
                            type: 'string',
                            title: 'Memcached Host',
                            description: 'Memcached server hostname',
                        },
                        memcached_port: {
                            type: 'integer',
                            title: 'Memcached Port',
                            minimum: 1,
                            maximum: 65535,
                            default: 11211,
                            description: 'Memcached server port',
                        },
                    },
                    required: ['memcached_host'],
                },
                {
                    properties: {
                        storage_type: { const: 'none' },
                    },
                },
            ],
        },
    },
};

/**
 * Real APISIX proxy-rewrite plugin schema
 * This is the actual schema from the APISIX repository
 * Used to test SchemaForm against production-ready schemas
 */
const proxyRewriteSchema: JSONSchema7 = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'proxy-rewrite Plugin Configuration',
    description: 'Rewrite upstream request info (uri, host, headers, method)',
    type: 'object',
    properties: {
        uri: {
            type: 'string',
            title: 'New URI',
            description: 'New URI for upstream request. Must start with /',
            minLength: 1,
            maxLength: 4096,
        },
        method: {
            type: 'string',
            title: 'HTTP Method',
            description: 'Proxy route method',
            enum: ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'MKCOL', 'COPY', 'MOVE', 'PROPFIND', 'LOCK', 'UNLOCK', 'PATCH', 'TRACE'],
        },
        regex_uri: {
            type: 'array',
            title: 'Regex URI',
            description: 'Regex patterns for URI rewriting. Pass pairs of [pattern, replacement]. Lower priority than uri.',
            items: {
                type: 'string',
            },
            minItems: 2,
        },
        host: {
            type: 'string',
            title: 'Host',
            description: 'New host for upstream request',
        },
        headers: {
            type: 'object',
            title: 'Headers Configuration',
            description: 'Headers to add, set, or remove',
            properties: {
                add: {
                    type: 'array',
                    title: 'Headers to Add',
                    description: 'Headers to add to the request (will not overwrite existing)',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                title: 'Header Name',
                            },
                            value: {
                                type: 'string',
                                title: 'Header Value',
                            },
                        },
                        required: ['name', 'value'],
                    },
                },
                set: {
                    type: 'array',
                    title: 'Headers to Set',
                    description: 'Headers to set (will overwrite existing)',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                title: 'Header Name',
                            },
                            value: {
                                type: 'string',
                                title: 'Header Value',
                            },
                        },
                        required: ['name', 'value'],
                    },
                },
                remove: {
                    type: 'array',
                    title: 'Headers to Remove',
                    description: 'Header names to remove from request',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
        use_real_request_uri_unsafe: {
            type: 'boolean',
            title: 'Use Real Request URI (UNSAFE)',
            description: 'Use real_request_uri instead. THIS IS VERY UNSAFE.',
            default: false,
        },
    },
    // At least one property must be set
    minProperties: 1,
};

export const Route = createFileRoute('/schema_form_demo')({
    component: SchemaFormDemoPage,
});

function SchemaFormDemoPage() {
    const demoForm = useForm({
        defaultValues: {
            auth_type: '',
            storage_type: 'none',
            rate_limit: 100,
            enable_logging: false,
            regex_uri: [],
            remove_headers: [],
            custom_headers: [],
        },
    });

    const proxyRewriteForm = useForm({
        resolver: createSchemaResolver(proxyRewriteSchema),
        defaultValues: {
            uri: '',
            method: '',
            regex_uri: [],
            host: '',
            headers: {
                add: [],
                set: [],
                remove: [],
            },
            use_real_request_uri_unsafe: false,
        },
    });

    const demoFormValues = demoForm.watch();
    const proxyRewriteFormValues = proxyRewriteForm.watch();

    const handleDemoSubmit = demoForm.handleSubmit((data) => {
        alert(`Demo Form Data:\n${JSON.stringify(data, null, 2)}`);
    });

    const handleProxyRewriteSubmit = proxyRewriteForm.handleSubmit((data) => {
        alert(`Proxy Rewrite Config:\n${JSON.stringify(data, null, 2)}`);
    });

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <div>
                    <Title order={1}>JSON Schema Form Demo</Title>
                    <Text c="dimmed" mt="xs">
                        This demo shows automatic form generation from JSON Schema with{' '}
                        <Code>oneOf</Code>, <Code>dependencies</Code>, and <Code>array</Code> support.
                    </Text>
                </div>

                <Tabs defaultValue="demo">
                    <Tabs.List>
                        <Tabs.Tab value="demo">Demo Schema</Tabs.Tab>
                        <Tabs.Tab value="proxy-rewrite">proxy-rewrite Plugin</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="demo" pt="md">
                        <Alert color="blue" title="How it works" mb="md">
                            <Stack gap="xs">
                                <Text size="sm">
                                    • <strong>oneOf:</strong> Select &quot;oauth&quot; or
                                    &quot;api_key&quot; to see different fields appear
                                </Text>
                                <Text size="sm">
                                    • <strong>dependencies:</strong> Select &quot;redis&quot; or
                                    &quot;memcached&quot; storage to see configuration fields
                                </Text>
                                <Text size="sm">
                                    • <strong>arrays (string):</strong> Use tags input for string arrays like
                                    &quot;Regex URI Patterns&quot; and &quot;Headers to Remove&quot;
                                </Text>
                                <Text size="sm">
                                    • <strong>arrays (object):</strong> Use dynamic forms with Add/Remove for
                                    &quot;Custom Headers&quot; (array of objects)
                                </Text>
                            </Stack>
                        </Alert>

                        <Grid>
                            <Grid.Col span={6}>
                                <Card withBorder shadow="sm">
                                    <Card.Section withBorder inheritPadding py="xs">
                                        <Title order={3}>Generated Form</Title>
                                    </Card.Section>
                                    <Card.Section inheritPadding py="md">
                                        <FormProvider {...demoForm}>
                                            <form onSubmit={handleDemoSubmit}>
                                                <Stack gap="md">
                                                    <SchemaForm schema={demoSchema} />
                                                    <Group justify="flex-end" mt="md">
                                                        <Button type="button" variant="subtle" onClick={() => demoForm.reset()}>
                                                            Reset
                                                        </Button>
                                                        <Button type="submit">Submit</Button>
                                                    </Group>
                                                </Stack>
                                            </form>
                                        </FormProvider>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Card withBorder shadow="sm" h="100%">
                                    <Card.Section withBorder inheritPadding py="xs">
                                        <Title order={3}>Live Form Data</Title>
                                    </Card.Section>
                                    <Card.Section inheritPadding py="md">
                                        <Code block style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(demoFormValues, null, 2)}
                                        </Code>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>
                        </Grid>

                        <Card withBorder shadow="sm" mt="md">
                            <Card.Section withBorder inheritPadding py="xs">
                                <Title order={3}>JSON Schema (Source)</Title>
                            </Card.Section>
                            <Card.Section inheritPadding py="md">
                                <Code
                                    block
                                    style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}
                                >
                                    {JSON.stringify(demoSchema, null, 2)}
                                </Code>
                            </Card.Section>
                        </Card>
                    </Tabs.Panel>

                    <Tabs.Panel value="proxy-rewrite" pt="md">
                        <Alert color="green" title="Real APISIX Plugin Schema" mb="md">
                            <Stack gap="xs">
                                <Text size="sm">
                                    This is the actual <strong>proxy-rewrite</strong> plugin schema from APISIX.
                                </Text>
                                <Text size="sm">
                                    • <strong>uri:</strong> Simple string input for new upstream URI
                                </Text>
                                <Text size="sm">
                                    • <strong>method:</strong> Dropdown with HTTP method options
                                </Text>
                                <Text size="sm">
                                    • <strong>regex_uri:</strong> String array for regex patterns
                                </Text>
                                <Text size="sm">
                                    • <strong>headers:</strong> Nested object with add/set (object arrays) and remove (string array)
                                </Text>
                            </Stack>
                        </Alert>

                        <Grid>
                            <Grid.Col span={6}>
                                <Card withBorder shadow="sm">
                                    <Card.Section withBorder inheritPadding py="xs">
                                        <Title order={3}>proxy-rewrite Configuration</Title>
                                    </Card.Section>
                                    <Card.Section inheritPadding py="md">
                                        <FormProvider {...proxyRewriteForm}>
                                            <form onSubmit={handleProxyRewriteSubmit}>
                                                <Stack gap="md">
                                                    <SchemaForm schema={proxyRewriteSchema} />
                                                    <Group justify="flex-end" mt="md">
                                                        <Button type="button" variant="subtle" onClick={() => proxyRewriteForm.reset()}>
                                                            Reset
                                                        </Button>
                                                        <Button type="submit">Submit</Button>
                                                    </Group>
                                                </Stack>
                                            </form>
                                        </FormProvider>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Card withBorder shadow="sm" h="100%">
                                    <Card.Section withBorder inheritPadding py="xs">
                                        <Title order={3}>Live Form Data</Title>
                                    </Card.Section>
                                    <Card.Section inheritPadding py="md">
                                        <Code block style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(proxyRewriteFormValues, null, 2)}
                                        </Code>
                                    </Card.Section>
                                </Card>
                            </Grid.Col>
                        </Grid>

                        <Card withBorder shadow="sm" mt="md">
                            <Card.Section withBorder inheritPadding py="xs">
                                <Title order={3}>proxy-rewrite Schema (Source)</Title>
                            </Card.Section>
                            <Card.Section inheritPadding py="md">
                                <Code
                                    block
                                    style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}
                                >
                                    {JSON.stringify(proxyRewriteSchema, null, 2)}
                                </Code>
                            </Card.Section>
                        </Card>
                    </Tabs.Panel>
                </Tabs>
            </Stack>
        </Container>
    );
}

