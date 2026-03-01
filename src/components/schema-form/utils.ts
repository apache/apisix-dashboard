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

import type { JSONSchema } from './types';

export function getSchemaType(schema: JSONSchema): string | undefined {
  if (schema.type) {
    return Array.isArray(schema.type) ? schema.type[0] : schema.type;
  }
  if (schema.enum) return 'string';
  if (schema.properties) return 'object';
  if (schema.items) return 'array';
  if (schema.oneOf) return 'oneOf';
  if (schema.anyOf) return 'anyOf';
  return undefined;
}

export function isEnumField(schema: JSONSchema): boolean {
  return Array.isArray(schema.enum) && schema.enum.length > 0;
}

export function isEncryptField(
  fieldName: string,
  encryptFields?: string[]
): boolean {
  if (!encryptFields || encryptFields.length === 0) return false;
  const baseName = fieldName.split('.').pop() ?? fieldName;
  return encryptFields.includes(baseName);
}

export function isRequired(fieldName: string, parentSchema: JSONSchema): boolean {
  if (!parentSchema.required) return false;
  const baseName = fieldName.split('.').pop() ?? fieldName;
  return parentSchema.required.includes(baseName);
}

export function getRequiredSet(schema: JSONSchema): Set<string> {
  return new Set(schema.required ?? []);
}

export function resolveDefaults(schema: JSONSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  if (schema.type !== 'object' || !schema.properties) return defaults;

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if (propSchema.default !== undefined) {
      defaults[key] = propSchema.default;
    } else if (propSchema.type === 'object' && propSchema.properties) {
      const nested = resolveDefaults(propSchema);
      if (Object.keys(nested).length > 0) {
        defaults[key] = nested;
      }
    }
  }
  return defaults;
}

export function fieldPath(rootPath: string, fieldName: string): string {
  if (!rootPath) return fieldName;
  return `${rootPath}.${fieldName}`;
}

export function getFieldLabel(name: string, schema: JSONSchema): string {
  if (schema.title) return schema.title;
  const baseName = name.split('.').pop() ?? name;
  return baseName
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function getFieldDescription(schema: JSONSchema): string | undefined {
  return schema.description;
}

export function hasConditionals(schema: JSONSchema): boolean {
  return !!(schema.if && (schema.then || schema.else));
}

export function hasDependencies(schema: JSONSchema): boolean {
  return !!(
    schema.dependencies && Object.keys(schema.dependencies).length > 0
  );
}

export function evaluateIfCondition(
  schema: JSONSchema,
  data: Record<string, unknown>
): 'then' | 'else' | null {
  if (!schema.if) return null;

  const ifSchema = schema.if;
  if (ifSchema.properties) {
    for (const [key, propSchema] of Object.entries(ifSchema.properties)) {
      const value = data[key];
      if (propSchema.enum) {
        if (!propSchema.enum.includes(value)) return 'else';
      }
      if (propSchema.type) {
        const expectedType = Array.isArray(propSchema.type)
          ? propSchema.type[0]
          : propSchema.type;
        if (typeof value !== expectedType) return 'else';
      }
    }
    return 'then';
  }
  return null;
}

export function mergeSchemas(base: JSONSchema, extension: JSONSchema): JSONSchema {
  const merged: JSONSchema = { ...base };

  if (extension.properties) {
    merged.properties = { ...merged.properties, ...extension.properties };
  }
  if (extension.required) {
    const existingRequired = new Set(merged.required ?? []);
    for (const req of extension.required) {
      existingRequired.add(req);
    }
    merged.required = [...existingRequired];
  }
  return merged;
}

export function getOneOfMatchIndex(
  oneOfSchemas: JSONSchema[],
  data: Record<string, unknown>
): number {
  for (let i = 0; i < oneOfSchemas.length; i++) {
    const subSchema = oneOfSchemas[i];
    if (subSchema.required) {
      const allPresent = subSchema.required.every((key) => {
        const val = data[key];
        return val !== undefined && val !== null && val !== '';
      });
      if (allPresent) return i;
    }
    if (subSchema.properties) {
      let matches = true;
      for (const [key, propSchema] of Object.entries(subSchema.properties)) {
        const val = data[key];
        if (propSchema.enum && !propSchema.enum.includes(val)) {
          matches = false;
          break;
        }
      }
      if (matches && Object.keys(subSchema.properties).length > 0) return i;
    }
  }
  return 0;
}

export function getOneOfLabel(schema: JSONSchema, index: number): string {
  if (schema.title) return schema.title;
  if (schema.required && schema.required.length > 0) {
    return schema.required.join(' + ');
  }
  if (schema.properties) {
    const keys = Object.keys(schema.properties);
    if (keys.length > 0) return keys.join(' + ');
  }
  return `Option ${index + 1}`;
}
