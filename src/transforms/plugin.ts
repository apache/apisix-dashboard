import { v4 as uuidv4 } from 'uuid';
import { Rule } from 'antd/es/form';

/**
 * Transform schema data from API for target plugin.
 */
export const transformSchemaFromAPI = (schema: PluginSchema, pluginName: string): PluginSchema => {
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

  if (pluginName === 'prometheus' || pluginName === 'node-status') {
    return {
      ...schema,
      properties: {
        enabled: {
          // TODO: i18n
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
export const transformSchemaToAPI = (schema: PluginSchema, pluginName: string) => {
  return { schema, pluginName };
};

/**
 * Transform schema's property to rules.
 */
export const transformPropertyToRules = (
  schema: PluginSchema,
  propertyName: string,
  propertyValue: PluginProperty,
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
