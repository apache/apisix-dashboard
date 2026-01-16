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
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { FieldErrors, FieldValues } from 'react-hook-form';

import type { JSONSchema7 } from './types';

// Create AJV instance with formats support
const ajv = new Ajv({
    allErrors: true, // Report all errors, not just the first one
    verbose: true, // Include schema and data in error objects
    strict: false, // Be lenient with schema keywords
});

// Add format validators (email, uri, date, etc.)
addFormats(ajv);

/**
 * Validates form data against a JSON Schema using AJV
 * @param schema - The JSON Schema to validate against
 * @param data - The form data to validate
 * @returns Object containing isValid flag and any errors
 */
export function validateWithSchema<T extends FieldValues>(
    schema: JSONSchema7,
    data: T
): { isValid: boolean; errors: FieldErrors<T> } {
    const validate = ajv.compile(schema);
    const isValid = validate(data);

    if (isValid) {
        return { isValid: true, errors: {} as FieldErrors<T> };
    }

    // Map AJV errors to React Hook Form format
    const errors = mapAjvErrorsToFormErrors<T>(validate.errors || []);
    return { isValid: false, errors };
}

/**
 * Maps AJV error objects to React Hook Form field errors format
 * AJV uses JSON Pointer format (e.g., "/headers/add/0/name")
 * React Hook Form uses dot notation (e.g., "headers.add.0.name")
 */
function mapAjvErrorsToFormErrors<T extends FieldValues>(
    ajvErrors: ErrorObject[]
): FieldErrors<T> {
    const errors: Record<string, { type: string; message: string }> = {};

    ajvErrors.forEach((error) => {
        // Convert AJV instance path to form field path
        // AJV: "/headers/add/0/name" -> RHF: "headers.add.0.name"
        let fieldPath = error.instancePath
            .replace(/^\//, '') // Remove leading slash
            .replace(/\//g, '.'); // Replace slashes with dots

        // Handle root-level errors (required fields at root)
        if (error.keyword === 'required' && error.params.missingProperty) {
            const missingProp = error.params.missingProperty as string;
            fieldPath = fieldPath ? `${fieldPath}.${missingProp}` : missingProp;
        }

        // Handle additionalProperties error
        if (error.keyword === 'additionalProperties' && error.params.additionalProperty) {
            const extraProp = error.params.additionalProperty as string;
            fieldPath = fieldPath ? `${fieldPath}.${extraProp}` : extraProp;
        }

        // Skip if no field path (root-level schema errors)
        if (!fieldPath && !['required', 'minProperties'].includes(error.keyword)) {
            return;
        }

        // Generate user-friendly error message
        const message = generateErrorMessage(error);

        // Don't overwrite existing errors for the same field
        if (!errors[fieldPath || '_root']) {
            errors[fieldPath || '_root'] = {
                type: error.keyword,
                message,
            };
        }
    });

    return errors as unknown as FieldErrors<T>;
}

/**
 * Generates a user-friendly error message from an AJV error
 */
function generateErrorMessage(error: ErrorObject): string {
    const { keyword, params, message } = error;

    switch (keyword) {
        case 'required':
            return `${formatFieldName(params.missingProperty as string)} is required`;
        case 'type':
            return `Must be a ${params.type}`;
        case 'minLength':
            return `Must be at least ${params.limit} characters`;
        case 'maxLength':
            return `Must be at most ${params.limit} characters`;
        case 'minimum':
            return `Must be at least ${params.limit}`;
        case 'maximum':
            return `Must be at most ${params.limit}`;
        case 'pattern':
            return `Invalid format`;
        case 'enum':
            return `Must be one of: ${(params.allowedValues as string[]).join(', ')}`;
        case 'minItems':
            return `Must have at least ${params.limit} items`;
        case 'maxItems':
            return `Must have at most ${params.limit} items`;
        case 'format':
            return `Invalid ${params.format} format`;
        case 'additionalProperties':
            return `Unknown field: ${params.additionalProperty}`;
        default:
            return message || 'Invalid value';
    }
}

/**
 * Formats a field name for display in error messages
 * e.g., "oauth_client_id" -> "OAuth Client ID"
 */
function formatFieldName(name: string): string {
    if (!name) return 'This field';
    return name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Creates a React Hook Form resolver that uses AJV for validation
 * This can be passed to useForm({ resolver: createSchemaResolver(schema) })
 */
export function createSchemaResolver(schema: JSONSchema7) {
    return async <T extends FieldValues>(data: T) => {
        const { isValid, errors } = validateWithSchema(schema, data);

        if (isValid) {
            return { values: data, errors: {} };
        }

        return {
            values: {},
            errors,
        };
    };
}

export { ajv };
