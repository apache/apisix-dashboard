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

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { FieldErrors } from 'react-hook-form';

import type { JSONSchema } from './types';

let ajvInstance: Ajv | null = null;

function getAjv(): Ajv {
  if (!ajvInstance) {
    ajvInstance = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export interface ValidationError {
  path: string;
  message: string;
}

export function validateAgainstSchema(
  schema: JSONSchema,
  data: unknown
): ValidationError[] {
  const ajv = getAjv();
  const errors: ValidationError[] = [];

  // Remove APISIX-specific fields that AJV doesn't understand
  const cleanSchema = stripNonStandardFields(schema);

  let validate: ReturnType<Ajv['compile']>;
  try {
    validate = ajv.compile(cleanSchema);
  } catch {
    return [{ path: '', message: 'Failed to compile schema for validation' }];
  }

  const valid = validate(data);
  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      const path = ajvErrorToFieldPath(err.instancePath, err.params);
      const message = formatAjvError(err);
      errors.push({ path, message });
    }
  }

  return errors;
}

export function validationErrorsToFieldErrors(
  errors: ValidationError[]
): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const err of errors) {
    const key = err.path || 'root';
    if (!fieldErrors[key]) {
      fieldErrors[key] = { message: err.message, type: 'validate' };
    }
  }
  return fieldErrors;
}

function ajvErrorToFieldPath(
  instancePath: string,
  params?: Record<string, unknown>
): string {
  let path = instancePath.replace(/^\//, '').replace(/\//g, '.');

  if (params?.missingProperty) {
    const missing = params.missingProperty as string;
    path = path ? `${path}.${missing}` : missing;
  }

  return path;
}

function formatAjvError(error: {
  keyword: string;
  message?: string;
  params?: Record<string, unknown>;
  instancePath: string;
}): string {
  const { keyword, message, params } = error;

  switch (keyword) {
    case 'required':
      return `${params?.missingProperty ?? 'Field'} is required`;
    case 'type':
      return `Must be of type ${params?.type ?? 'unknown'}`;
    case 'minimum':
      return `Must be >= ${params?.limit}`;
    case 'maximum':
      return `Must be <= ${params?.limit}`;
    case 'exclusiveMinimum':
      return `Must be > ${params?.limit}`;
    case 'exclusiveMaximum':
      return `Must be < ${params?.limit}`;
    case 'minLength':
      return `Must be at least ${params?.limit} characters`;
    case 'maxLength':
      return `Must be at most ${params?.limit} characters`;
    case 'pattern':
      return `Must match pattern: ${params?.pattern}`;
    case 'enum':
      return `Must be one of: ${(params?.allowedValues as unknown[])?.join(', ')}`;
    case 'minItems':
      return `Must have at least ${params?.limit} items`;
    case 'maxItems':
      return `Must have at most ${params?.limit} items`;
    case 'uniqueItems':
      return 'Items must be unique';
    case 'oneOf':
      return 'Must match exactly one of the options';
    case 'anyOf':
      return 'Must match at least one of the options';
    default:
      return message ?? `Validation failed: ${keyword}`;
  }
}

function stripNonStandardFields(schema: JSONSchema): JSONSchema {
  const cleaned = { ...schema };

  delete (cleaned as Record<string, unknown>)['encrypt_fields'];
  delete (cleaned as Record<string, unknown>)['_meta'];
  delete (cleaned as Record<string, unknown>)['$comment'];

  if (cleaned.properties) {
    const props: Record<string, JSONSchema> = {};
    for (const [key, value] of Object.entries(cleaned.properties)) {
      props[key] = stripNonStandardFields(value);
    }
    cleaned.properties = props;
  }

  if (cleaned.items && !Array.isArray(cleaned.items)) {
    cleaned.items = stripNonStandardFields(cleaned.items);
  }

  if (cleaned.oneOf) {
    cleaned.oneOf = cleaned.oneOf.map(stripNonStandardFields);
  }
  if (cleaned.anyOf) {
    cleaned.anyOf = cleaned.anyOf.map(stripNonStandardFields);
  }
  if (cleaned.allOf) {
    cleaned.allOf = cleaned.allOf.map(stripNonStandardFields);
  }

  if (cleaned.if) cleaned.if = stripNonStandardFields(cleaned.if);
  if (cleaned.then) cleaned.then = stripNonStandardFields(cleaned.then);
  if (cleaned.else) cleaned.else = stripNonStandardFields(cleaned.else);

  return cleaned;
}
