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
export const INIT_CHART = {
  offset: { x: 0, y: 0 },
  scale: 0.577,
  nodes: {},
  links: {},
  selected: {},
  hovered: {},
};

export const PLUGINS_PORTS = {
  port1: {
    id: 'port1',
    type: 'input',
    properties: {
      custom: 'property',
    },
  },
  port2: {
    id: 'port2',
    type: 'output',
    properties: {
      custom: 'property',
    },
  },
};

export const CONDITION_PORTS = {
  port1: {
    id: 'port1',
    type: 'input',
  },
  port2: {
    id: 'port2',
    type: 'output',
    properties: {
      value: 'no',
    },
  },
  port3: {
    id: 'port3',
    type: 'output',
    properties: {
      value: 'yes',
    },
  },
};
