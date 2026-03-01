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
  evaluateIfCondition,
  fieldPath,
  getFieldLabel,
  getOneOfLabel,
  getOneOfMatchIndex,
  getRequiredSet,
  getSchemaType,
  hasConditionals,
  hasDependencies,
  isEncryptField,
  isEnumField,
  isRequired,
  mergeSchemas,
  resolveDefaults,
} from '../utils';

describe('getSchemaType', () => {
  it('returns the type string directly', () => {
    expect(getSchemaType({ type: 'string' })).toBe('string');
    expect(getSchemaType({ type: 'integer' })).toBe('integer');
    expect(getSchemaType({ type: 'boolean' })).toBe('boolean');
  });

  it('returns first type from array', () => {
    expect(getSchemaType({ type: ['string', 'null'] })).toBe('string');
  });

  it('infers type from enum', () => {
    expect(getSchemaType({ enum: ['a', 'b'] })).toBe('string');
  });

  it('infers object from properties', () => {
    expect(getSchemaType({ properties: { foo: { type: 'string' } } })).toBe('object');
  });

  it('infers array from items', () => {
    expect(getSchemaType({ items: { type: 'string' } })).toBe('array');
  });

  it('infers oneOf', () => {
    expect(getSchemaType({ oneOf: [{ type: 'string' }] })).toBe('oneOf');
  });

  it('returns undefined for empty schema', () => {
    expect(getSchemaType({})).toBeUndefined();
  });
});

describe('isEnumField', () => {
  it('returns true for schema with enum', () => {
    expect(isEnumField({ enum: ['a', 'b', 'c'] })).toBe(true);
  });

  it('returns false for schema without enum', () => {
    expect(isEnumField({ type: 'string' })).toBe(false);
  });

  it('returns false for empty enum', () => {
    expect(isEnumField({ enum: [] })).toBe(false);
  });
});

describe('isEncryptField', () => {
  it('returns true when field name is in encrypt list', () => {
    expect(isEncryptField('client_secret', ['client_secret', 'client_key'])).toBe(true);
  });

  it('handles dotted paths by checking last segment', () => {
    expect(isEncryptField('auth.client_secret', ['client_secret'])).toBe(true);
  });

  it('returns false when not in list', () => {
    expect(isEncryptField('client_id', ['client_secret'])).toBe(false);
  });

  it('returns false for undefined list', () => {
    expect(isEncryptField('secret', undefined)).toBe(false);
  });
});

describe('isRequired', () => {
  it('returns true when field is in required array', () => {
    const schema: JSONSchema = { type: 'object', required: ['name', 'key'] };
    expect(isRequired('name', schema)).toBe(true);
  });

  it('returns false when field is not in required array', () => {
    const schema: JSONSchema = { type: 'object', required: ['name'] };
    expect(isRequired('key', schema)).toBe(false);
  });

  it('returns false when no required array', () => {
    expect(isRequired('name', { type: 'object' })).toBe(false);
  });
});

describe('getRequiredSet', () => {
  it('returns a Set of required fields', () => {
    const schema: JSONSchema = { required: ['a', 'b'] };
    const set = getRequiredSet(schema);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
    expect(set.has('c')).toBe(false);
  });

  it('returns empty Set for no required', () => {
    expect(getRequiredSet({}).size).toBe(0);
  });
});

describe('resolveDefaults', () => {
  it('extracts defaults from properties', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        policy: { type: 'string', default: 'local' },
        timeout: { type: 'integer', default: 3 },
        name: { type: 'string' },
      },
    };
    const defaults = resolveDefaults(schema);
    expect(defaults).toEqual({ policy: 'local', timeout: 3 });
  });

  it('handles nested objects', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        session: {
          type: 'object',
          properties: {
            storage: { type: 'string', default: 'cookie' },
          },
        },
      },
    };
    const defaults = resolveDefaults(schema);
    expect(defaults).toEqual({ session: { storage: 'cookie' } });
  });

  it('returns empty for non-object schemas', () => {
    expect(resolveDefaults({ type: 'string' })).toEqual({});
  });
});

describe('fieldPath', () => {
  it('combines root and field name', () => {
    expect(fieldPath('config', 'timeout')).toBe('config.timeout');
  });

  it('returns field name when root is empty', () => {
    expect(fieldPath('', 'timeout')).toBe('timeout');
  });
});

describe('getFieldLabel', () => {
  it('uses schema title when available', () => {
    expect(getFieldLabel('foo', { title: 'My Field' })).toBe('My Field');
  });

  it('generates label from field name', () => {
    expect(getFieldLabel('redis_host', {})).toBe('Redis host');
  });

  it('handles camelCase', () => {
    expect(getFieldLabel('clientSecret', {})).toBe('Client Secret');
  });

  it('handles dotted paths', () => {
    expect(getFieldLabel('config.redis_host', {})).toBe('Redis host');
  });
});

describe('hasConditionals', () => {
  it('returns true for if/then', () => {
    expect(hasConditionals({ if: { properties: {} }, then: {} })).toBe(true);
  });

  it('returns false for no conditionals', () => {
    expect(hasConditionals({ type: 'object' })).toBe(false);
  });
});

describe('hasDependencies', () => {
  it('returns true when dependencies exist', () => {
    expect(hasDependencies({ dependencies: { a: ['b'] } })).toBe(true);
  });

  it('returns false for empty', () => {
    expect(hasDependencies({})).toBe(false);
  });
});

describe('evaluateIfCondition', () => {
  it('returns then when enum matches', () => {
    const schema: JSONSchema = {
      if: { properties: { policy: { enum: ['redis'] } } },
      then: { required: ['redis_host'] },
      else: {},
    };
    expect(evaluateIfCondition(schema, { policy: 'redis' })).toBe('then');
  });

  it('returns else when enum does not match', () => {
    const schema: JSONSchema = {
      if: { properties: { policy: { enum: ['redis'] } } },
      then: { required: ['redis_host'] },
      else: {},
    };
    expect(evaluateIfCondition(schema, { policy: 'local' })).toBe('else');
  });

  it('returns null when no if condition', () => {
    expect(evaluateIfCondition({}, {})).toBeNull();
  });
});

describe('mergeSchemas', () => {
  it('merges properties from two schemas', () => {
    const base: JSONSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
    };
    const ext: JSONSchema = {
      properties: { b: { type: 'integer' } },
      required: ['b'],
    };
    const merged = mergeSchemas(base, ext);
    expect(merged.properties?.a).toBeDefined();
    expect(merged.properties?.b).toBeDefined();
    expect(merged.required).toContain('b');
  });
});

describe('getOneOfMatchIndex', () => {
  it('matches by required fields', () => {
    const schemas: JSONSchema[] = [
      { required: ['conn', 'burst'] },
      { required: ['rules'] },
    ];
    expect(getOneOfMatchIndex(schemas, { conn: 10, burst: 5 })).toBe(0);
    expect(getOneOfMatchIndex(schemas, { rules: [{}] })).toBe(1);
  });

  it('defaults to 0 when no match', () => {
    const schemas: JSONSchema[] = [
      { required: ['a'] },
      { required: ['b'] },
    ];
    expect(getOneOfMatchIndex(schemas, {})).toBe(0);
  });
});

describe('getOneOfLabel', () => {
  it('uses title when available', () => {
    expect(getOneOfLabel({ title: 'Redis Mode' }, 0)).toBe('Redis Mode');
  });

  it('uses required fields as label', () => {
    expect(getOneOfLabel({ required: ['conn', 'burst'] }, 0)).toBe('conn + burst');
  });

  it('falls back to Option N', () => {
    expect(getOneOfLabel({}, 2)).toBe('Option 3');
  });
});
