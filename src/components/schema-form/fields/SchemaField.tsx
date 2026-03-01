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

import { Text } from '@mantine/core';

import type { FieldProps } from '../types';
import { getSchemaType, isEnumField } from '../utils';
import { AnyOfField } from './AnyOfField';
import { ArrayField } from './ArrayField';
import { BooleanField } from './BooleanField';
import { EnumField } from './EnumField';
import { NumberField } from './NumberField';
import { ObjectField } from './ObjectField';
import { OneOfField } from './OneOfField';
import { PatternPropertiesField } from './PatternPropertiesField';
import { StringField } from './StringField';

export const SchemaField: React.FC<FieldProps> = (props) => {
  const { schema, name } = props;

  // Handle enum fields first (any type with enum values)
  if (isEnumField(schema)) {
    return <EnumField {...props} />;
  }

  // Handle oneOf at the field level (type unions like integer | string)
  if (schema.oneOf && !schema.properties) {
    // Check if this is a simple type union (e.g., [{type: "integer"}, {type: "string"}])
    const allSimpleTypes = schema.oneOf.every(
      (s) => s.type && !s.properties && !s.oneOf && !s.anyOf
    );
    if (allSimpleTypes) {
      // Render as the first type option (usually the primary type)
      const primarySchema = { ...schema, ...schema.oneOf[0], oneOf: undefined };
      return <SchemaField {...props} schema={primarySchema} />;
    }
    return <OneOfField {...props} />;
  }

  // Handle anyOf
  if (schema.anyOf && !schema.type && !schema.properties) {
    return <AnyOfField {...props} />;
  }

  const schemaType = getSchemaType(schema);

  switch (schemaType) {
    case 'string':
      return <StringField {...props} />;

    case 'number':
    case 'integer':
      return <NumberField {...props} />;

    case 'boolean':
      return <BooleanField {...props} />;

    case 'object':
      // Check for patternProperties without regular properties
      if (schema.patternProperties && !schema.properties) {
        return <PatternPropertiesField {...props} />;
      }
      return <ObjectField {...props} />;

    case 'array':
      return <ArrayField {...props} />;

    case 'oneOf':
      return <OneOfField {...props} />;

    case 'anyOf':
      return <AnyOfField {...props} />;

    default:
      return (
        <Text size="xs" c="dimmed">
          Unsupported schema type for field &quot;{name}&quot;
        </Text>
      );
  }
};
