/*
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
import { v4 as uuidv4 } from 'uuid';
import { Rule } from 'antd/es/form';

/**
 * Transform schema data from API for target plugin.
 */
export const transformSchemaFromAPI = (
  schema: PluginForm.PluginSchema,
  pluginName: string,
): PluginForm.PluginSchema => {
  if (pluginName === 'key-auth') {
    return {
      ...schema,
      properties: {
        key: {
          ...schema.properties!.key,
          default: uuidv4(),
        },
      },
    };
  }

  if (pluginName === 'prometheus' || pluginName === 'node-status' || pluginName === 'heartbeat') {
    return {
      ...schema,
      properties: {
        enabled: {
          type: 'boolean',
          default: false,
        },
      },
    };
  }

  return schema;
};

/**
 * Transform schema data to be compatible with API.
 */
// eslint-disable-next-line arrow-body-style
export const transformSchemaToAPI = (schema: PluginForm.PluginSchema, pluginName: string) => {
  return { schema, pluginName };
};

/**
 * Transform schema's property to rules.
 */
export const transformPropertyToRules = (
  schema: PluginForm.PluginSchema,
  propertyName: string,
  propertyValue: PluginForm.PluginProperty,
): Rule[] => {
  if (!schema) {
    return [];
  }

  const { type, minLength, maxLength, minimum, maximum, pattern } = propertyValue;

  const requiredRule = schema.required?.includes(propertyName) ? [{ required: true }] : [];
  const typeRule = [{ type }];
  const enumRule = propertyValue.enum ? [{ type: 'enum', enum: propertyValue.enum }] : [];
  const rangeRule =
    type !== 'string' &&
    type !== 'array' &&
    (propertyValue.hasOwnProperty('minimum') || propertyValue.hasOwnProperty('maximum'))
      ? [
          {
            min: minimum ?? Number.MIN_SAFE_INTEGER,
            max: maximum ?? Number.MAX_SAFE_INTEGER,
          },
        ]
      : [];
  const lengthRule =
    type === 'string' || type === 'array'
      ? [{ min: minLength ?? Number.MIN_SAFE_INTEGER, max: maxLength ?? Number.MAX_SAFE_INTEGER }]
      : [];
  const customPattern = pattern ? [{ pattern: new RegExp(pattern) }] : [];

  const rules = [
    ...requiredRule,
    ...typeRule,
    ...enumRule,
    ...rangeRule,
    ...lengthRule,
    ...customPattern,
  ];
  const flattend = rules.reduce((prev, next) => ({ ...prev, ...next }));
  return [flattend] as Rule[];
};
