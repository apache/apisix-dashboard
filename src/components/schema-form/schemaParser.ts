/**
 * schemaParser.ts
 * Parses a JSON Schema object into a flat list of fields
 * that SchemaForm can render.
 */

export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'enum';

export interface ParsedField {
  // unique key for the field
  name: string;
  // display label
  label: string;
  // field type
  type: FieldType;
  // is this field required?
  required: boolean;
  // default value if any
  defaultValue?: unknown;
  // enum options if type is enum
  options?: string[];
  // min/max for numbers
  minimum?: number;
  maximum?: number;
  // minLength/maxLength for strings
  minLength?: number;
  maxLength?: number;
  // regex pattern for strings
  pattern?: string;
  // nested fields for objects
  fields?: ParsedField[];
  // description/help text
  description?: string;
  // oneOf options
  oneOf?: { title: string; schema: JSONSchema }[];
  // raw schema for complex types
  schema?: JSONSchema;
}

export interface JSONSchema {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  enum?: unknown[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  description?: string;
  title?: string;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  items?: JSONSchema;
  dependencies?: Record<string, JSONSchema>;
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
}

/**
 * Main parser function
 * Takes a JSON Schema and returns a list of ParsedFields
 */
export function parseSchema(
  schema: JSONSchema,
  requiredFields: string[] = []
): ParsedField[] {
  if (!schema || !schema.properties) return [];

  const fields: ParsedField[] = [];

  for (const [name, fieldSchema] of Object.entries(schema.properties)) {
    const field = parseField(name, fieldSchema, requiredFields);
    if (field) fields.push(field);
  }

  return fields;
}

/**
 * Parses a single field from its schema definition
 */
function parseField(
  name: string,
  schema: JSONSchema,
  requiredFields: string[]
): ParsedField {
  const required = requiredFields.includes(name);
  const label = schema.title || formatLabel(name);

  // enum field
  if (schema.enum) {
    return {
      name,
      label,
      type: 'enum',
      required,
      options: schema.enum.map(String),
      defaultValue: schema.default,
      description: schema.description,
    };
  }

  // oneOf field
  if (schema.oneOf) {
    return {
      name,
      label,
      type: 'object',
      required,
      description: schema.description,
      oneOf: schema.oneOf.map((s, i) => ({
        title: s.title || `Option ${i + 1}`,
        schema: s,
      })),
      schema,
    };
  }

  const type = Array.isArray(schema.type)
    ? (schema.type[0] as FieldType)
    : (schema.type as FieldType) || 'string';

  // nested object
  if (type === 'object' && schema.properties) {
    return {
      name,
      label,
      type: 'object',
      required,
      description: schema.description,
      fields: parseSchema(schema, schema.required || []),
      schema,
    };
  }

  return {
    name,
    label,
    type,
    required,
    defaultValue: schema.default,
    minimum: schema.minimum,
    maximum: schema.maximum,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    pattern: schema.pattern,
    description: schema.description,
    schema,
  };
}

/**
 * Converts snake_case or camelCase to Title Case label
 * e.g. "rate_limit" → "Rate Limit"
 */
function formatLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}