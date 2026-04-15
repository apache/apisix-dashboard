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
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { SchemaField } from './SchemaField';
import type { JSONSchema7 } from './types';
import { ajv } from './validation';

export type SchemaFormProps = {
    schema: JSONSchema7;
    basePath?: string;
};

/**
 * SchemaForm - Renders a form from JSON Schema
 *
 * Handles:
 * - Basic types (string, number, boolean, enum)
 * - oneOf/anyOf (conditional field groups)
 * - dependencies (conditional fields based on other field values)
 */
export const SchemaForm = ({ schema, basePath = '' }: SchemaFormProps) => {
    const { control } = useFormContext();

    // Render all properties defined in the schema
    const renderProperties = () => {
        if (!schema.properties) return null;

        return Object.entries(schema.properties).map(([key, propSchema]) => {
            const fieldPath = basePath ? `${basePath}.${key}` : key;
            const isRequired = schema.required?.includes(key) ?? false;
            // encrypt_fields is an APISIX extension that marks fields as sensitive
            const isEncrypted =
                ((schema as Record<string, unknown>).encrypt_fields as string[] | undefined)?.includes(key) ?? false;

            return (
                <SchemaField
                    key={fieldPath}
                    name={fieldPath}
                    schema={propSchema as JSONSchema7}
                    control={control}
                    required={isRequired}
                    isEncrypted={isEncrypted}
                />
            );
        });
    };

    // Handle oneOf - conditional field groups based on a discriminator
    const renderOneOf = () => {
        if (!schema.oneOf) return null;

        return <VariantFields variants={schema.oneOf as JSONSchema7[]} basePath={basePath} />;
    };

    // Handle dependencies - conditional fields
    const renderDependencies = () => {
        if (!schema.dependencies) return null;

        return Object.entries(schema.dependencies).map(([depKey, depSchema]) => (
            <DependencyFields
                key={depKey}
                dependsOn={depKey}
                schema={depSchema as JSONSchema7}
                basePath={basePath}
            />
        ));
    };

    // Handle anyOf - same intent as oneOf in APISIX schemas: pick one branch
    const renderAnyOf = () => {
        if (!schema.anyOf) return null;
        return <VariantFields variants={schema.anyOf as JSONSchema7[]} basePath={basePath} />;
    };

    // Handle if/then/else - evaluate condition on live form data
    const renderIfThenElse = () => {
        if (!schema.if) return null;
        return <IfThenElseFields schema={schema} basePath={basePath} />;
    };

    return (
        <>
            {renderProperties()}
            {renderOneOf()}
            {renderAnyOf()}
            {renderDependencies()}
            {renderIfThenElse()}
        </>
    );
};

/**
 * Recursively collects all RHF field paths from a JSON Schema subtree.
 * Example:
 *   Schema: { redis_config: { type: 'object', properties: { host: {}, port: {} } } }
 *   Returns: ["redis_config.host", "redis_config.port"]
 *
 * This ensures we explicitly unregister every leaf field, not just parent keys,
 * which guarantees full subtree removal from formState.errors and formState.values.
 */
function collectAllPaths(schema: JSONSchema7, prefix = ''): string[] {
    if (!schema.properties) return prefix ? [prefix] : [];

    return Object.entries(schema.properties).flatMap(([key, propSchema]) => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const child = propSchema as JSONSchema7;

        if (child.type === 'object' && child.properties) {
            return collectAllPaths(child, fullPath);
        }
        return [fullPath];
    });
}

/**
 * VariantFields - Renders conditional field groups based on a discriminator field
 */
const VariantFields = ({
    variants,
    basePath,
}: {
    variants: JSONSchema7[];
    basePath: string;
}) => {
    const { control, unregister } = useFormContext();

    // Find the discriminator field (the const property in branches)
    const discriminators = findDiscriminators(variants);
    const firstDiscriminator = discriminators[0];

    // Watch the discriminator field value
    const discriminatorPath = basePath
        ? `${basePath}.${firstDiscriminator}`
        : firstDiscriminator;
    const watchedValue = useWatch({ control, name: discriminatorPath });

    // Collect ALL field names from ALL branches (excluding the discriminator)
    const allBranchFields = useMemo(
        () =>
            variants.flatMap((branch) => {
                const b = branch as JSONSchema7;
                const filtered: JSONSchema7 = {
                    properties: Object.fromEntries(
                        Object.entries(b.properties ?? {}).filter(
                            ([k]) => k !== firstDiscriminator
                        )
                    ),
                };
                return collectAllPaths(filtered);
            }),
        [variants, firstDiscriminator]
    );

    // When discriminator changes, unregister fields from ALL other branches
    // so they don't pollute the submit payload.
    useEffect(() => {
        const activeBranch = variants.find((branch) => {
            const branchSchema = branch as JSONSchema7;
            const constValue =
                branchSchema.properties?.[firstDiscriminator] as JSONSchema7;
            return constValue?.const === watchedValue;
        }) as JSONSchema7 | undefined;

        const activeProps = Object.keys(activeBranch?.properties ?? {}).filter(
            (k) => k !== firstDiscriminator
        );

        const toUnregister = allBranchFields.filter(
            (f) => !activeProps.includes(f)
        );

        if (toUnregister.length > 0) {
            const paths = toUnregister.map((f) =>
                basePath ? `${basePath}.${f}` : f
            );
            unregister(paths as Parameters<typeof unregister>[0]);
        }
    }, [
        watchedValue,
        allBranchFields,
        basePath,
        firstDiscriminator,
        variants,
        unregister,
    ]);

    // Find matching branch
    const matchingBranch = variants.find((branch) => {
        const branchSchema = branch as JSONSchema7;
        const constValue =
            branchSchema.properties?.[firstDiscriminator] as JSONSchema7;
        return constValue?.const === watchedValue;
    }) as JSONSchema7 | undefined;

    if (!matchingBranch?.properties) return null;

    // Render fields from matching branch (excluding the discriminator itself)
    return (
        <>
            {Object.entries(matchingBranch.properties)
                .filter(([key]) => key !== firstDiscriminator)
                .map(([key, propSchema]) => {
                    const fieldPath = basePath ? `${basePath}.${key}` : key;
                    const isRequired =
                        matchingBranch.required?.includes(key) ?? false;

                    return (
                        <SchemaField
                            key={fieldPath}
                            name={fieldPath}
                            schema={propSchema as JSONSchema7}
                            control={control}
                            required={isRequired}
                        />
                    );
                })}
        </>
    );
};

/**
 * DependencyFields - Renders fields conditionally based on another field's value
 */
const DependencyFields = ({
    dependsOn,
    schema,
    basePath,
}: {
    dependsOn: string;
    schema: JSONSchema7;
    basePath: string;
}) => {
    const { control } = useFormContext();

    // Watch the field this depends on
    const watchPath = basePath ? `${basePath}.${dependsOn}` : dependsOn;
    const watchedValue = useWatch({ control, name: watchPath });

    // Handle dependencies with oneOf (conditional based on value)
    if (schema.oneOf) {
        const matchingBranch = schema.oneOf.find((branch) => {
            const branchSchema = branch as JSONSchema7;
            const constValue = branchSchema.properties?.[dependsOn] as JSONSchema7;
            return constValue?.const === watchedValue;
        }) as JSONSchema7 | undefined;

        if (!matchingBranch?.properties) return null;

        return (
            <>
                {Object.entries(matchingBranch.properties)
                    .filter(([key]) => key !== dependsOn)
                    .map(([key, propSchema]) => {
                        const fieldPath = basePath ? `${basePath}.${key}` : key;
                        const isRequired =
                            matchingBranch.required?.includes(key) ?? false;

                        return (
                            <SchemaField
                                key={fieldPath}
                                name={fieldPath}
                                schema={propSchema as JSONSchema7}
                                control={control}
                                required={isRequired}
                            />
                        );
                    })}
            </>
        );
    }

    // Handle simple dependencies (show if field has any value)
    if (schema.properties && watchedValue) {
        return (
            <>
                {Object.entries(schema.properties).map(([key, propSchema]) => {
                    const fieldPath = basePath ? `${basePath}.${key}` : key;
                    const isRequired = schema.required?.includes(key) ?? false;

                    return (
                        <SchemaField
                            key={fieldPath}
                            name={fieldPath}
                            schema={propSchema as JSONSchema7}
                            control={control}
                            required={isRequired}
                        />
                    );
                })}
            </>
        );
    }

    return null;
};


/**
 * IfThenElseFields - Renders fields conditionally using JSON Schema Draft 7
 */
const IfThenElseFields = ({
    schema,
    basePath,
}: {
    schema: JSONSchema7;
    basePath: string;
}) => {
    const { control, unregister } = useFormContext();

    // Extract ONLY the field names used in the 'if' condition
    const ifFieldNames = useMemo(() => {
        if (!schema.if?.properties) return [];
        return Object.keys(schema.if.properties).map((key) =>
            basePath ? `${basePath}.${key}` : key
        );
    }, [schema.if, basePath]);

    // Watch exactly the fields needed for the condition, not the whole form
    const watchedValueArray = useWatch({
        control,
        name: ifFieldNames as [string, ...string[]],
    });

    const { activeBranch, inactiveBranch } = useMemo(() => {
        if (!schema.if) return { activeBranch: null, inactiveBranch: null };

        // Reconstruct the data subset for AJV evaluation using the watched values
        const dataToCheck = ifFieldNames.reduce<Record<string, unknown>>(
            (acc, path, idx) => {
                const key = basePath ? path.replace(`${basePath}.`, '') : path;
                acc[key] = Array.isArray(watchedValueArray)
                    ? watchedValueArray[idx]
                    : watchedValueArray;
                return acc;
            },
            {}
        );

        const validate = ajv.compile(schema.if as object);
        const ifMatches = validate(dataToCheck);
        return ifMatches
            ? {
                  activeBranch: schema.then ?? null,
                  inactiveBranch: schema.else ?? null,
              }
            : {
                  activeBranch: schema.else ?? null,
                  inactiveBranch: schema.then ?? null,
              };
    }, [schema.if, schema.then, schema.else, ifFieldNames, watchedValueArray, basePath]);

    useEffect(() => {
        if (!inactiveBranch?.properties) return;

        const toUnregister = collectAllPaths(inactiveBranch);
        const paths = toUnregister.map((f) => (basePath ? `${basePath}.${f}` : f));
        unregister(paths as Parameters<typeof unregister>[0]);
    }, [inactiveBranch, basePath, unregister]);

    if (!activeBranch?.properties) return null;

    return (
        <>
            {Object.entries(activeBranch.properties).map(([key, propSchema]) => {
                const fieldPath = basePath ? `${basePath}.${key}` : key;
                const isRequired = activeBranch.required?.includes(key) ?? false;

                return (
                    <SchemaField
                        key={fieldPath}
                        name={fieldPath}
                        schema={propSchema as JSONSchema7}
                        control={control}
                        required={isRequired}
                    />
                );
            })}
        </>
    );
};

/**
 * Find discriminator field names from oneOf/anyOf branches
 */
function findDiscriminators(oneOf: JSONSchema7['oneOf']): string[] {
    if (!oneOf) return [];

    const discriminators = new Set<string>();

    oneOf.forEach((branch) => {
        const branchSchema = branch as JSONSchema7;
        if (branchSchema.properties) {
            Object.entries(branchSchema.properties).forEach(([key, value]) => {
                const propSchema = value as JSONSchema7;
                if (propSchema.const !== undefined) {
                    discriminators.add(key);
                }
            });
        }
    });

    return Array.from(discriminators);
}
