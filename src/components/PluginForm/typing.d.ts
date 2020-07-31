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
