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

/**
 * JSON Schema 7 Type Definition
 * Simplified version containing the properties we support
 */
export interface JSONSchema7 {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    default?: unknown;
    const?: unknown;

    // String constraints
    minLength?: number;
    maxLength?: number;
    pattern?: string;

    // Number constraints
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;

    // Array constraints
    items?: JSONSchema7 | JSONSchema7[];
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;

    // Object constraints
    properties?: Record<string, JSONSchema7>;
    required?: string[];
    additionalProperties?: boolean | JSONSchema7;
    minProperties?: number;
    maxProperties?: number;

    // Enum
    enum?: unknown[];

    // Conditional
    oneOf?: JSONSchema7[];
    anyOf?: JSONSchema7[];
    allOf?: JSONSchema7[];
    not?: JSONSchema7;
    if?: JSONSchema7;
    then?: JSONSchema7;
    else?: JSONSchema7;

    // Dependencies (Draft 7)
    dependencies?: Record<string, JSONSchema7 | string[]>;
}
