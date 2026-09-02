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
import { describe, expect, it } from 'vitest';

import type { JSONSchema7 } from './types';
import { createSchemaResolver, serializePatternProperties, validateWithSchema } from './validation';

// ---------------------------------------------------------------------------
// validateWithSchema
// ---------------------------------------------------------------------------

describe('validateWithSchema', () => {
    it('returns isValid:true when data satisfies the schema', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
        };
        const { isValid, errors } = validateWithSchema(schema, { name: 'APISIX' });
        expect(isValid).toBe(true);
        expect(errors).toEqual({});
    });

    it('returns isValid:false with error when required field is missing', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { host: { type: 'string' } },
            required: ['host'],
        };
        const { isValid, errors } = validateWithSchema(schema, {});
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('host');
        expect((errors as Record<string, { message: string }>).host.message).toMatch(
            /required/i
        );
    });

    it('reports type mismatch error', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { port: { type: 'integer' } },
        };
        const { isValid, errors } = validateWithSchema(schema, { port: 'not-a-number' });
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('port');
    });

    it('reports minLength violation', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { token: { type: 'string', minLength: 8 } },
        };
        const { isValid, errors } = validateWithSchema(schema, { token: 'short' });
        expect(isValid).toBe(false);
        const tokenError = (errors as Record<string, { message: string }>).token;
        expect(tokenError.message).toMatch(/8/);
    });

    it('reports minimum constraint violation', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { rate: { type: 'integer', minimum: 1 } },
        };
        const { isValid, errors } = validateWithSchema(schema, { rate: 0 });
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('rate');
    });

    it('reports maximum constraint violation', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { rate: { type: 'integer', maximum: 100 } },
        };
        const { isValid, errors } = validateWithSchema(schema, { rate: 101 });
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('rate');
    });

    it('reports pattern violation', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: { uri: { type: 'string', pattern: '^/' } },
        };
        const { isValid, errors } = validateWithSchema(schema, { uri: 'no-leading-slash' });
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('uri');
        expect((errors as Record<string, { message: string }>).uri.message).toMatch(
            /invalid format/i
        );
    });

    it('reports enum constraint violation', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                method: { type: 'string', enum: ['GET', 'POST', 'PUT'] },
            },
        };
        const { isValid, errors } = validateWithSchema(schema, { method: 'INVALID' });
        expect(isValid).toBe(false);
        const methodError = (errors as Record<string, { message: string }>).method;
        expect(methodError.message).toMatch(/GET/);
    });

    it('reports minItems violation on arrays', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                uris: { type: 'array', items: { type: 'string' }, minItems: 2 },
            },
        };
        const { isValid, errors } = validateWithSchema(schema, { uris: ['only-one'] });
        expect(isValid).toBe(false);
        const urisError = (errors as Record<string, { message: string }>).uris;
        expect(urisError.message).toMatch(/2/);
    });

    it('validates nested object fields and maps path correctly', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                headers: {
                    type: 'object',
                    properties: {
                        add: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    value: { type: 'string' },
                                },
                                required: ['name', 'value'],
                            },
                        },
                    },
                },
            },
        };
        // Missing 'value' in the first array item → error at "headers.add.0.value"
        const { isValid, errors } = validateWithSchema(schema, {
            headers: { add: [{ name: 'X-Foo' }] },
        });
        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('headers.add.0.value');
    });

    it('passes with valid data against a complex APISIX-style schema', () => {
        const schema: JSONSchema7 = {
            type: 'object',
            properties: {
                uri: { type: 'string', minLength: 1, maxLength: 4096 },
                method: {
                    type: 'string',
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                },
                use_real_request_uri_unsafe: { type: 'boolean' },
            },
            minProperties: 1,
        };
        const { isValid } = validateWithSchema(schema, { uri: '/api/v1/users' });
        expect(isValid).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// createSchemaResolver  (async RHF resolver)
// ---------------------------------------------------------------------------

describe('createSchemaResolver', () => {
    const schema: JSONSchema7 = {
        type: 'object',
        properties: {
            host: { type: 'string', minLength: 1 },
            port: { type: 'integer', minimum: 1, maximum: 65535 },
        },
        required: ['host'],
    };

    it('resolves with values when data is valid', async () => {
        const resolver = createSchemaResolver(schema);
        const data = { host: 'localhost', port: 6379 };
        const result = await resolver(data);
        expect(result.values).toEqual(data);
        expect(result.errors).toEqual({});
    });

    it('resolves with errors and empty values when data is invalid', async () => {
        const resolver = createSchemaResolver(schema);
        const result = await resolver({});
        expect(result.values).toEqual({});
        expect(result.errors).toHaveProperty('host');
    });

    it('error message for required field is human-readable', async () => {
        const resolver = createSchemaResolver(schema);
        const result = await resolver({});
        const hostError = (result.errors as Record<string, { message: string }>).host;
        expect(hostError.message).toMatch(/required/i);
    });
});

// ---------------------------------------------------------------------------
// PatternProperties Serialization
// ---------------------------------------------------------------------------

describe('serializePatternProperties', () => {
    it('converts key-value pairs to a string map', () => {
        const result = serializePatternProperties([
            { key: 'X-Foo', value: 'bar' },
            { key: 'X-Baz', value: 'qux' },
        ]);
        expect(result).toEqual({ 'X-Foo': 'bar', 'X-Baz': 'qux' });
    });

    it('filters out entries with empty keys', () => {
        const result = serializePatternProperties([
            { key: '', value: 'bar' },
            { key: 'X-Keep', value: 'yes' },
        ]);
        expect(result).toEqual({ 'X-Keep': 'yes' });
    });
});
