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
import type { Addon, Cell, Graph } from '@antv/x6';
import { Dom, Shape } from '@antv/x6';
import { formatMessage } from 'umi';

export const DEFAULT_STENCIL_WIDTH = 280;
export const DEFAULT_TOOLBAR_HEIGHT = 38;
export const DEFAULT_SHAPE_TEXT_EDIT_CLASS_NAME = '.flow-graph-shape-text-editor';

export const DEFAULT_OPINIONS: Partial<Graph.Options> = {
  scroller: true,
  width: 800,
  height: 600,
  grid: {
    size: 10,
    visible: true,
  },
  selecting: {
    enabled: true,
    multiple: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
    filter: ['groupNode'],
  },
  connecting: {
    allowBlank: false,
    highlight: true,
    snap: true,
    createEdge() {
      return new Shape.Edge({
        attrs: {
          line: {
            stroke: '#5F95FF',
            strokeWidth: 1,
            targetMarker: {
              name: 'classic',
              size: 8,
            },
          },
        },
        router: {
          name: 'manhattan',
        },
        zIndex: 0,
      });
    },
    validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
      if (sourceView === targetView) {
        return false;
      }
      if (!sourceMagnet) {
        return false;
      }
      if (!targetMagnet) {
        return false;
      }
      return true;
    },
  },
  highlighting: {
    magnetAvailable: {
      name: 'stroke',
      args: {
        padding: 4,
        attrs: {
          strokeWidth: 4,
          stroke: 'rgba(223,234,255)',
        },
      },
    },
  },
  snapline: true,
  history: true,
  clipboard: {
    enabled: true,
  },
  keyboard: {
    enabled: true,
  },
  embedding: {
    enabled: true,
    findParent({ node }) {
      const bbox = node.getBBox();
      return this.getNodes().filter((item) => {
        const data = item.getData<any>();
        if (data && data.parent) {
          const targetBBox = item.getBBox();
          return bbox.isIntersectWithRect(targetBBox);
        }
        return false;
      });
    },
  },
};

export const DEFAULT_STENCIL_OPINIONS: Partial<Addon.Stencil.Options> = {
  title: formatMessage({ id: 'component.plugin-flow.text.nodes-area' }),
  stencilGraphWidth: DEFAULT_STENCIL_WIDTH,
  search: (cell, keyword) => {
    if (keyword) {
      return (cell as any).label?.indexOf(keyword) !== -1;
    }
    return true;
  },
  notFoundText: formatMessage({ id: 'component.plugin-flow.text.nodes.not-found' }),
  placeholder: formatMessage({ id: 'component.plugin-flow.text.search-nodes.placeholder' }),
  collapsable: true,
};

export const DEFAULT_SHAPE_RECT_OPINIONS = {
  inherit: 'rect',
  width: 80,
  height: 42,
  attrs: {
    body: {
      stroke: '#5F95FF',
      strokeWidth: 1,
      fill: 'rgba(95,149,255,0.05)',
    },
    fo: {
      refWidth: '100%',
      refHeight: '100%',
    },
    foBody: {
      xmlns: Dom.ns.xhtml,
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    text: {
      fontSize: 12,
      fill: 'rgba(0,0,0,0.85)',
      textWrap: {
        text: '',
        width: -10,
      },
    },
  },
  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
    {
      tagName: 'text',
      selector: 'text',
    },
  ],
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            r: 3,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            r: 3,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            r: 3,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            r: 3,
            magnet: true,
            stroke: '#5F95FF',
            strokeWidth: 1,
            fill: '#fff',
            style: {
              visibility: 'hidden',
            },
          },
        },
      },
    },
    items: [
      {
        group: 'top',
      },
      {
        group: 'right',
      },
      {
        group: 'bottom',
      },
      {
        group: 'left',
      },
    ],
  },
};

export enum FlowGraphShape {
  base = 'flow-chart-rect',
  condition = 'flow-chart-condition-rect',
  start = 'flow-chart-start-rect',
  end = 'flow-chart-end-rect',
  plugin = 'flow-chart-plugin-rect',
}

export enum FlowGraphEvent {
  PLUGIN_CHANGE = 'flowgraph:change:plugin',
  CONDITION_CHANGE = 'flowgraph:change:condition',
}

export const DEFAULT_PLUGIN_PROPS = {
  id: '',
  name: '',
  visible: false,
  data: {},
};

export const DEFAULT_CONDITION_PROPS = {
  visible: false,
  id: '',
  data: '',
};

export const DEFAULT_PLUGIN_FLOW_DATA: {
  chart: {
    cells: Cell.Properties[];
  };
  conf: Record<string, any>;
  rule: Record<string, any>;
} = {
  chart: {
    cells: [],
  },
  conf: {},
  rule: {
    root: '',
  },
};
