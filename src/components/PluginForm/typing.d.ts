declare namespace PluginForm {
  interface Props {
    name?: string;
    disabled?: boolean;
    // FormInstance
    form: any;
    initialData?: PluginSchema;
    onFinish(values: any): void;
  }

  interface PluginSchema {
    type: 'object';
    id?: string;
    required?: string[];
    additionalProperties?: boolean;
    minProperties?: number;
    oneOf?: Array<{
      required: string[];
    }>;
    properties?: {
      [propertyName: string]: PluginProperty;
    };
  }

  interface PluginProperty {
    type: 'number' | 'string' | 'integer' | 'array' | 'boolean' | 'object';
    // the same as type
    default?: any;
    description?: string;
    // NOTE: maybe 0.00001
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    // e.g "^/.*"
    pattern?: string;
    enum?: string[];
    requried?: string[];
    minProperties?: number;
    additionalProperties?: boolean;
    items?: {
      type: string;
      anyOf?: Array<{
        type?: string;
        description?: string;
        enum?: string[];
        pattern?: string;
      }>;
    };
  }

  type PluginCategory = 'Security' | 'Limit' | 'Log' | 'Metric' | 'Other';

  type PluginMapperItem = {
    category: PluginCategory;
    hidden?: boolean;
  };

  interface PluginProps extends PluginMapperItem {
    name: string;
  }
}
