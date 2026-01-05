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
import { useFormContext, useWatch } from 'react-hook-form';

import { SchemaField } from './SchemaField';
import type { JSONSchema7 } from './types';

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

            return (
                <SchemaField
                    key={fieldPath}
                    name={fieldPath}
                    schema={propSchema as JSONSchema7}
                    control={control}
                    required={isRequired}
                />
            );
        });
    };

    // Handle oneOf - conditional field groups based on a discriminator
    const renderOneOf = () => {
        if (!schema.oneOf) return null;

        return <OneOfFields schema={schema} basePath={basePath} />;
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

    return (
        <>
            {renderProperties()}
            {renderOneOf()}
            {renderDependencies()}
        </>
    );
};

/**
 * OneOfFields - Renders conditional field groups based on a discriminator field
 */
const OneOfFields = ({
    schema,
    basePath,
}: {
    schema: JSONSchema7;
    basePath: string;
}) => {
    const { control } = useFormContext();

    // Find the discriminator field (the const property in oneOf branches)
    const discriminators = findDiscriminators(schema.oneOf!);
    const firstDiscriminator = discriminators[0];

    // Watch the discriminator field value
    const discriminatorPath = basePath
        ? `${basePath}.${firstDiscriminator}`
        : firstDiscriminator;
    const watchedValue = useWatch({ control, name: discriminatorPath });

    // Find matching oneOf branch
    const matchingBranch = schema.oneOf?.find((branch) => {
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
                    const isRequired = matchingBranch.required?.includes(key) ?? false;

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
 * Find discriminator field names from oneOf branches
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

export { SchemaField } from './SchemaField';
export type { JSONSchema7 } from './types';
