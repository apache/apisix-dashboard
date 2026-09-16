/**
 * schemaParser.test.ts
 * Unit tests for the schema parser utility
 */

import { parseSchema } from '../schemaParser';

describe('parseSchema', () => {

  // ── Basic Types ────────────────────────────────────────────────────────

  test('parses string field correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        username: { type: 'string' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].name).toBe('username');
    expect(fields[0].type).toBe('string');
  });

  test('parses number field correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        rate: { type: 'number', minimum: 0, maximum: 100 },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].type).toBe('number');
    expect(fields[0].minimum).toBe(0);
    expect(fields[0].maximum).toBe(100);
  });

  test('parses boolean field correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].type).toBe('boolean');
  });

  test('parses enum field correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          enum: ['remote_addr', 'server_addr', 'consumer_name'],
        },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].type).toBe('enum');
    expect(fields[0].options).toEqual([
      'remote_addr',
      'server_addr',
      'consumer_name',
    ]);
  });

  test('parses array field correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        tags: { type: 'array' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].type).toBe('array');
  });

  // ── Required Fields ────────────────────────────────────────────────────

  test('marks required fields correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        username: { type: 'string' },
        nickname: { type: 'string' },
      },
      required: ['username'],
    };
    const fields = parseSchema(schema, schema.required);
    const username = fields.find((f) => f.name === 'username');
    const nickname = fields.find((f) => f.name === 'nickname');
    expect(username?.required).toBe(true);
    expect(nickname?.required).toBe(false);
  });

  // ── Constraints ────────────────────────────────────────────────────────

  test('parses minLength and maxLength', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 3, maxLength: 50 },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].minLength).toBe(3);
    expect(fields[0].maxLength).toBe(50);
  });

  test('parses pattern constraint', () => {
    const schema = {
      type: 'object',
      properties: {
        email: { type: 'string', pattern: '^[a-z]+@[a-z]+\\.com$' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].pattern).toBe('^[a-z]+@[a-z]+\\.com$');
  });

  // ── Labels ─────────────────────────────────────────────────────────────

  test('formats snake_case name as label', () => {
    const schema = {
      type: 'object',
      properties: {
        rate_limit: { type: 'number' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].label).toBe('Rate Limit');
  });

  test('uses title from schema if available', () => {
    const schema = {
      type: 'object',
      properties: {
        rate: { type: 'number', title: 'Request Rate' },
      },
    };
    const fields = parseSchema(schema, []);
    expect(fields[0].label).toBe('Request Rate');
  });

  // ── Empty / Edge Cases ─────────────────────────────────────────────────

  test('returns empty array for empty schema', () => {
    const fields = parseSchema({}, []);
    expect(fields).toEqual([]);
  });

  test('returns empty array when no properties', () => {
    const schema = { type: 'object' };
    const fields = parseSchema(schema, []);
    expect(fields).toEqual([]);
  });

  // ── Real APISIX Plugin Schema ──────────────────────────────────────────

  test('parses limit-req plugin schema correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        rate: { type: 'number', minimum: 0 },
        burst: { type: 'number', minimum: 0 },
        key: {
          type: 'string',
          enum: ['remote_addr', 'server_addr', 'consumer_name'],
        },
        rejected_code: { type: 'integer', minimum: 200, maximum: 599 },
      },
      required: ['rate', 'burst', 'key'],
    };
    const fields = parseSchema(schema, schema.required);

    expect(fields).toHaveLength(4);
    expect(fields.find((f) => f.name === 'rate')?.required).toBe(true);
    expect(fields.find((f) => f.name === 'burst')?.required).toBe(true);
    expect(fields.find((f) => f.name === 'key')?.type).toBe('enum');
    expect(
      fields.find((f) => f.name === 'rejected_code')?.required
    ).toBe(false);
  });
});