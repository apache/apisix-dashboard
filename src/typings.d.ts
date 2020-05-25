declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';

// google analytics interface
interface GAFieldsObject {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
}
interface Window {
  ga: (
    command: 'send',
    hitType: 'event' | 'pageview',
    fieldsObject: GAFieldsObject | string,
  ) => void;
  reloadAuthorized: () => void;
}

declare let ga: Function;

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;

type PageMode = 'CREATE' | 'EDIT' | 'VIEW';

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
