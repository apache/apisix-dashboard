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
 * JSON Transformer Utilities
 *
 * Provides bidirectional transformation between form state and JSON representation
 * for APISIX Dashboard resources.
 */

/**
 * Convert form data to formatted JSON string
 *
 * @param formData - The form data object
 * @param produceFn - Optional producer function to transform data before serialization
 * @returns Formatted JSON string with 2-space indentation
 */
export const formToJSON = <T>(
  formData: T,
  produceFn?: (data: T) => unknown
): string => {
  try {
    // Apply producer function if provided (e.g., produceRoute)
    const transformedData = produceFn ? produceFn(formData) : formData;

    // Convert to JSON with 2-space indentation for readability
    return JSON.stringify(transformedData, null, 2);
  } catch {
    throw new Error('Failed to convert form data to JSON');
  }
};

/**
 * Parse and validate JSON string, converting it to form data format
 *
 * @param jsonString - The JSON string to parse
 * @param parseFormFn - Optional function to transform parsed data to form format
 * @returns Parsed and transformed form data
 * @throws Error if JSON is invalid or transformation fails
 */
export const jsonToForm = <T>(
  jsonString: string,
  parseFormFn?: (data: unknown) => T
): T => {
  try {
    // Parse JSON string
    const parsed = JSON.parse(jsonString);

    // Apply form transformation if provided (e.g., produceVarsToForm)
    const formData = parseFormFn ? parseFormFn(parsed) : parsed;

    return formData as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON syntax');
    }
    throw new Error('Failed to convert JSON to form data');
  }
};

/**
 * Validate JSON syntax without parsing
 *
 * @param jsonString - The JSON string to validate
 * @returns Object with isValid flag and optional error message
 */
export const validateJSONSyntax = (
  jsonString: string
): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        isValid: false,
        error: error.message,
      };
    }
    return {
      isValid: false,
      error: 'Unknown JSON parsing error',
    };
  }
};
