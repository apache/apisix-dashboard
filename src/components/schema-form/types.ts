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

export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export interface JSONSchema {
  type?: JSONSchemaType | JSONSchemaType[];
  title?: string;
  description?: string;
  default?: unknown;

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;

  // Number/Integer constraints
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  // Enum
  enum?: unknown[];

  // Object
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  patternProperties?: Record<string, JSONSchema>;
  minProperties?: number;
  maxProperties?: number;

  // Array
  items?: JSONSchema | JSONSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Composition
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  not?: JSONSchema;

  // Conditional
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;

  // Dependencies (JSON Schema draft-07)
  dependencies?: Record<string, JSONSchema | string[]>;

  // References
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  definitions?: Record<string, JSONSchema>;

  // Meta
  $comment?: string;

  // APISIX-specific
  encrypt_fields?: string[];
}

export interface SchemaFormProps {
  schema: JSONSchema;
  value?: Record<string, unknown>;
  onChange?: (value: Record<string, unknown>) => void;
  onSubmit?: (value: Record<string, unknown>) => void;
  encryptFields?: string[];
  disabled?: boolean;
  rootPath?: string;
}

export interface FieldProps {
  schema: JSONSchema;
  name: string;
  required?: boolean;
  encryptFields?: string[];
  disabled?: boolean;
}

export type WidgetType =
  | 'text'
  | 'number'
  | 'password'
  | 'select'
  | 'switch'
  | 'textarea'
  | 'tags'
  | 'object'
  | 'array'
  | 'oneOf'
  | 'anyOf'
  | 'json'
  | 'patternProperties';

export interface WidgetRegistryEntry {
  component: React.ComponentType<FieldProps>;
  match: (schema: JSONSchema, fieldName: string, encryptFields?: string[]) => boolean;
  priority: number;
}
