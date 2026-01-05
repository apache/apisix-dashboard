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
    Text,
    Title,
} from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';

import { SchemaForm } from '@/components/form/SchemaForm';
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

export const Route = createFileRoute('/schema_form_demo')({
    component: SchemaFormDemoPage,
});

function SchemaFormDemoPage() {
    const form = useForm({
        defaultValues: {
            auth_type: '',
            storage_type: 'none',
            rate_limit: 100,
            enable_logging: false,
        },
    });

    const formValues = form.watch();

    const handleSubmit = form.handleSubmit((data) => {
         
        alert(`Form Data:\n${JSON.stringify(data, null, 2)}`);
    });

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <div>
                    <Title order={1}>JSON Schema Form Demo</Title>
                    <Text c="dimmed" mt="xs">
                        This demo shows automatic form generation from JSON Schema with{' '}
                        <Code>oneOf</Code> and <Code>dependencies</Code> support.
                    </Text>
                </div>

                <Alert color="blue" title="How it works">
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
                            • All fields are auto-generated from the JSON Schema
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
                                <FormProvider {...form}>
                                    <form onSubmit={handleSubmit}>
                                        <Stack gap="md">
                                            <SchemaForm schema={demoSchema} />
                                            <Group justify="flex-end" mt="md">
                                                <Button type="button" variant="subtle" onClick={() => form.reset()}>
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
                                    {JSON.stringify(formValues, null, 2)}
                                </Code>
                            </Card.Section>
                        </Card>
                    </Grid.Col>
                </Grid>

                <Card withBorder shadow="sm">
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
            </Stack>
        </Container>
    );
}
