import { v4 as uuidv4 } from 'uuid';

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

  if (pluginName === 'prometheus') {
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
