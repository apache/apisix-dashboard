/**
 * widgetMapper.test.ts
 * Unit tests for the widget mapper utility
 */

import { getWidget, getValidationRules } from '../widgetMapper';
import { type ParsedField } from '../schemaParser';

// ── Helper to create a mock field ─────────────────────────────────────────────
const mockField = (overrides: Partial<ParsedField>): ParsedField => ({
  name: 'test',
  label: 'Test',
  type: 'string',
  required: false,
  ...overrides,
});

describe('getWidget', () => {

  // ── Basic Type Mappings ────────────────────────────────────────────────

  test('maps string type to TextInput', () => {
    const field = mockField({ type: 'string' });
    expect(getWidget(field)).toBe('TextInput');
  });

  test('maps number type to NumberInput', () => {
    const field = mockField({ type: 'number' });
    expect(getWidget(field)).toBe('NumberInput');
  });

  test('maps integer type to NumberInput', () => {
    const field = mockField({ type: 'integer' });
    expect(getWidget(field)).toBe('NumberInput');
  });

  test('maps boolean type to Switch', () => {
    const field = mockField({ type: 'boolean' });
    expect(getWidget(field)).toBe('Switch');
  });

  test('maps enum type to Select', () => {
    const field = mockField({
      type: 'enum',
      options: ['a', 'b', 'c'],
    });
    expect(getWidget(field)).toBe('Select');
  });

  test('maps array type to TagInput', () => {
    const field = mockField({ type: 'array' });
    expect(getWidget(field)).toBe('TagInput');
  });

  test('maps object type to JsonInput', () => {
    const field = mockField({ type: 'object' });
    expect(getWidget(field)).toBe('JsonInput');
  });

  // ── Special Cases ──────────────────────────────────────────────────────

  test('maps password field to PasswordInput', () => {
    const field = mockField({ name: 'password', type: 'string' });
    expect(getWidget(field)).toBe('PasswordInput');
  });

  test('maps secret field to PasswordInput', () => {
    const field = mockField({ name: 'api_secret', type: 'string' });
    expect(getWidget(field)).toBe('PasswordInput');
  });

  test('maps token field to PasswordInput', () => {
    const field = mockField({ name: 'access_token', type: 'string' });
    expect(getWidget(field)).toBe('PasswordInput');
  });

  test('maps oneOf field to OneOfInput', () => {
    const field = mockField({
      type: 'object',
      oneOf: [
        { title: 'Option A', schema: {} },
        { title: 'Option B', schema: {} },
      ],
    });
    expect(getWidget(field)).toBe('OneOfInput');
  });

});

describe('getValidationRules', () => {

  // ── Required ───────────────────────────────────────────────────────────

  test('adds required rule when field is required', () => {
    const field = mockField({ required: true, label: 'Username' });
    const rules = getValidationRules(field);
    expect(rules.required).toBe('Username is required');
  });

  test('no required rule when field is not required', () => {
    const field = mockField({ required: false });
    const rules = getValidationRules(field);
    expect(rules.required).toBeUndefined();
  });

  // ── Number Constraints ─────────────────────────────────────────────────

  test('adds min rule for minimum constraint', () => {
    const field = mockField({ type: 'number', minimum: 0 });
    const rules = getValidationRules(field);
    expect((rules.min as { value: number }).value).toBe(0);
  });

  test('adds max rule for maximum constraint', () => {
    const field = mockField({ type: 'number', maximum: 100 });
    const rules = getValidationRules(field);
    expect((rules.max as { value: number }).value).toBe(100);
  });

  // ── String Constraints ─────────────────────────────────────────────────

  test('adds minLength rule', () => {
    const field = mockField({ type: 'string', minLength: 3 });
    const rules = getValidationRules(field);
    expect((rules.minLength as { value: number }).value).toBe(3);
  });

  test('adds maxLength rule', () => {
    const field = mockField({ type: 'string', maxLength: 50 });
    const rules = getValidationRules(field);
    expect((rules.maxLength as { value: number }).value).toBe(50);
  });

  test('adds pattern rule', () => {
    const field = mockField({
      type: 'string',
      pattern: '^[a-z]+$',
    });
    const rules = getValidationRules(field);
    expect(rules.pattern).toBeDefined();
  });

  // ── Error Messages ─────────────────────────────────────────────────────

  test('shows correct error message for min', () => {
    const field = mockField({ type: 'number', minimum: 5 });
    const rules = getValidationRules(field);
    expect((rules.min as { message: string }).message).toBe(
      'Minimum value is 5'
    );
  });

  test('shows correct error message for minLength', () => {
    const field = mockField({ type: 'string', minLength: 3 });
    const rules = getValidationRules(field);
    expect((rules.minLength as { message: string }).message).toBe(
      'Minimum length is 3'
    );
  });

});