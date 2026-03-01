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

import type { JSONSchema } from '../types';
import {
  validateAgainstSchema,
  validationErrorsToFieldErrors,
} from '../validation';

describe('validateAgainstSchema', () => {
  it('returns no errors for valid data', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string', minLength: 1 },
      },
      required: ['key'],
    };
    const errors = validateAgainstSchema(schema, { key: 'my-key' });
    expect(errors).toHaveLength(0);
  });

  it('returns error for missing required field', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string' },
      },
      required: ['key'],
    };
    const errors = validateAgainstSchema(schema, {});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('required');
  });

  it('validates type constraints', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        count: { type: 'integer', minimum: 1 },
      },
    };
    const errors = validateAgainstSchema(schema, { count: 0 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('validates string constraints', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 3 },
      },
    };
    const errors = validateAgainstSchema(schema, { name: 'ab' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('3');
  });

  it('validates enum constraints', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        policy: { type: 'string', enum: ['local', 'redis'] },
      },
    };
    const errors = validateAgainstSchema(schema, { policy: 'invalid' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('validates a limit-count-like schema', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        count: { type: 'integer', minimum: 1 },
        time_window: { type: 'integer', minimum: 1 },
        key: { type: 'string', default: 'remote_addr' },
        rejected_code: { type: 'integer', minimum: 200, maximum: 599, default: 503 },
        policy: {
          type: 'string',
          enum: ['local', 'redis', 'redis-cluster'],
          default: 'local',
        },
      },
    };

    const validData = {
      count: 100,
      time_window: 60,
      key: 'remote_addr',
      rejected_code: 503,
      policy: 'local',
    };
    expect(validateAgainstSchema(schema, validData)).toHaveLength(0);

    const invalidData = {
      count: 0,
      time_window: -1,
    };
    const errors = validateAgainstSchema(schema, invalidData);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('strips APISIX-specific fields without error', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        key: { type: 'string' },
      },
      encrypt_fields: ['secret'],
      $comment: 'this is a mark',
    };
    const errors = validateAgainstSchema(schema, { key: 'test' });
    expect(errors).toHaveLength(0);
  });
});

describe('validationErrorsToFieldErrors', () => {
  it('maps validation errors to field errors', () => {
    const errors = [
      { path: 'name', message: 'is required' },
      { path: 'count', message: 'must be >= 1' },
    ];
    const fieldErrors = validationErrorsToFieldErrors(errors);
    expect(fieldErrors.name).toBeDefined();
    expect(fieldErrors.count).toBeDefined();
  });

  it('uses root for empty path', () => {
    const errors = [{ path: '', message: 'schema error' }];
    const fieldErrors = validationErrorsToFieldErrors(errors);
    expect(fieldErrors.root).toBeDefined();
  });
});
