/**
 * widgetMapper.ts
 * Maps a ParsedField type to the correct
 * existing form component in the project.
 */

import { type ParsedField } from './schemaParser';

export type WidgetType =
  | 'TextInput'
  | 'NumberInput'
  | 'Switch'
  | 'Select'
  | 'Textarea'
  | 'JsonInput'
  | 'TagInput'
  | 'PasswordInput'
  | 'OneOfInput';

/**
 * Main mapper function
 * Takes a ParsedField and returns which widget to use
 *
 * Example:
 * { type: 'string' }  → 'TextInput'
 * { type: 'number' }  → 'NumberInput'
 * { type: 'boolean' } → 'Switch'
 * { type: 'enum' }    → 'Select'
 * { type: 'array' }   → 'TagInput'
 * { type: 'object' }  → 'JsonInput'
 */
export function getWidget(field: ParsedField): WidgetType {
  // oneOf gets its own special widget
  if (field.oneOf && field.oneOf.length > 0) {
    return 'OneOfInput';
  }

  // password format
  if (
    field.name.toLowerCase().includes('password') ||
    field.name.toLowerCase().includes('secret') ||
    field.name.toLowerCase().includes('token')
  ) {
    return 'PasswordInput';
  }

  switch (field.type) {
    case 'string':
      // long text gets textarea
      if (
        field.maxLength === undefined ||
        field.maxLength > 100
      ) {
        return 'TextInput';
      }
      return 'Textarea';

    case 'number':
    case 'integer':
      return 'NumberInput';

    case 'boolean':
      return 'Switch';

    case 'enum':
      return 'Select';

    case 'array':
      return 'TagInput';

    case 'object':
      return 'JsonInput';

    default:
      return 'TextInput';
  }
}

/**
 * Returns validation rules for react-hook-form
 * based on the field schema constraints
 */
export function getValidationRules(field: ParsedField) {
  const rules: Record<string, unknown> = {};

  if (field.required) {
    rules.required = `${field.label} is required`;
  }

  if (field.minimum !== undefined) {
    rules.min = {
      value: field.minimum,
      message: `Minimum value is ${field.minimum}`,
    };
  }

  if (field.maximum !== undefined) {
    rules.max = {
      value: field.maximum,
      message: `Maximum value is ${field.maximum}`,
    };
  }

  if (field.minLength !== undefined) {
    rules.minLength = {
      value: field.minLength,
      message: `Minimum length is ${field.minLength}`,
    };
  }

  if (field.maxLength !== undefined) {
    rules.maxLength = {
      value: field.maxLength,
      message: `Maximum length is ${field.maxLength}`,
    };
  }

  if (field.pattern) {
    rules.pattern = {
      value: new RegExp(field.pattern),
      message: `Must match pattern: ${field.pattern}`,
    };
  }

  return rules;
}