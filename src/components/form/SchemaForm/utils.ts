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

import type { JSONSchema7 } from './types';

/**
 * Known acronyms to always render in proper casing
 */
const ACRONYMS = new Map([
    // Core abbreviations
    ['id', 'ID'],
    ['uri', 'URI'],
    ['url', 'URL'],
    ['api', 'API'],
    ['jwt', 'JWT'],
    ['ip', 'IP'],
    ['ttl', 'TTL'],
    // Protocols & Auth
    ['http', 'HTTP'],
    ['https', 'HTTPS'],
    ['ssl', 'SSL'],
    ['tls', 'TLS'],
    ['oauth', 'OAuth'],
    ['cors', 'CORS'],
    // Common
    ['db', 'DB'],
    ['dns', 'DNS'],
    ['tcp', 'TCP'],
    ['udp', 'UDP']
]);

/**
 * Formats a field name into a human-readable label
 * e.g., "oauth_client_id" → "OAuth Client ID"
 */
export function formatLabel(name: string): string {
    // Get just the field name if it's a path
    const fieldName = name.split('.').pop() || name;

    return fieldName
        .split('_')
        .map((word) => {
            const lower = word.toLowerCase();
            return ACRONYMS.has(lower)
                ? ACRONYMS.get(lower)!
                : word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

/**
 * Recursively collects all schema paths used by a conditional branch.
 * Includes both parental nodes and leaf nodes to ensure deep unregistration in RHF.
 */
export function collectAllPaths(schema: JSONSchema7, prefix = ''): string[] {
    const paths: string[] = [];

    if (prefix) paths.push(prefix);

    if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, propSchema]) => {
            const childSchema = propSchema as JSONSchema7;
            const childPath = prefix ? `${prefix}.${key}` : key;

            if (childSchema.type === 'object' || childSchema.properties) {
                paths.push(...collectAllPaths(childSchema, childPath));
            } else if (childSchema.type === 'array' || childSchema.items || childSchema.patternProperties) {
                // Arrays and patternProperties register at the root level Since
                // dynamic indices aren't statically known from schema
                paths.push(childPath);
            } else {
                paths.push(childPath);
            }
        });
    }

    return paths;
}

/**
 * Find discriminator field names from oneOf/anyOf branches.
 * Matches both `const` value and single-item `enum`.
 */
export function findDiscriminators(variants: JSONSchema7['oneOf']): string[] {
    if (!variants) return [];

    const discriminators = new Set<string>();

    variants.forEach((branch) => {
        const branchSchema = branch as JSONSchema7;
        if (branchSchema.properties) {
            Object.entries(branchSchema.properties).forEach(([key, value]) => {
                const propSchema = value as JSONSchema7;
                // Treat as discriminator if restricted to a single explicit value
                if (
                    propSchema.const !== undefined ||
                    (propSchema.enum && propSchema.enum.length === 1)
                ) {
                    discriminators.add(key);
                }
            });
        }
    });

    return Array.from(discriminators);
}
