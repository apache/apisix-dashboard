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
import './shapes';

import type { Cell, Model } from '@antv/x6';
import { Addon, FunctionExt, Graph } from '@antv/x6';
import { notification } from 'antd';
import { formatMessage } from 'umi';

import {
  DEFAULT_OPINIONS,
  DEFAULT_PLUGIN_FLOW_DATA,
  DEFAULT_STENCIL_OPINIONS,
  FlowGraphEvent,
  FlowGraphShape,
} from '../../constants';

class FlowGraph {
  public static graph: Graph;
  private static stencil: Addon.Stencil;
  private static pluginTypeList: string[] = [];
  private static plugins: PluginComponent.Meta[] = [];

  public static init(
    container: HTMLElement,
    plugins: PluginComponent.Meta[] = [],
    chart: Model.FromJSONData,
  ) {
    this.graph = new Graph({
      container,
      ...DEFAULT_OPINIONS,
    });

    this.plugins = plugins;
    this.pluginTypeList = Array.from(new Set(plugins.map((item) => item.type)));

    this.initStencil();
    this.initShape();
    this.initGraphShape(chart);
    this.initEvent();
    return this.graph;
  }

  // NOTE: set cell data according to Cell ID
  public static setData(id: string, data: any): void {
    const cell = this.graph.getCell(id);
    if (cell) {
      cell.setData(data, { overwrite: true });
    }
  }

  // NOTE: Generate groups for stencil
  private static generateGroups(): Addon.Stencil.Group[] {
    const otherGroupList = [
      {
        name: 'basic',
        title: formatMessage({ id: 'component.plugin-flow.text.general' }),
        graphHeight: 104,
      },
    ];

    const pluginGroupList = this.pluginTypeList.map((item) => {
      const count = this.plugins.filter((plugin) => plugin.type === item).length;
      return {
        name: item,
        title: formatMessage({ id: `component.plugin.${item}` }),
        layoutOptions: {
          columns: 1,
          marginX: 60,
        },
        graphHeight: count * 82,
      };
    });

    return otherGroupList.concat(pluginGroupList);
  }

  private static initStencil() {
    this.stencil = new Addon.Stencil({
      target: this.graph,
      ...DEFAULT_STENCIL_OPINIONS,
      groups: this.generateGroups(),
    });
    const stencilContainer = document.querySelector('#stencil');
    stencilContainer?.appendChild(this.stencil.container);
  }

  private static initShape() {
    const { graph } = this;
    const r1 = graph.createNode({
      shape: FlowGraphShape.start,
      attrs: {
        body: {
          rx: 24,
          ry: 24,
        },
        text: {
          textWrap: {
            text: formatMessage({ id: 'component.plugin-flow.text.start-node' }),
          },
        },
      },
    });

    const r3 = graph.createNode({
      shape: FlowGraphShape.condition,
      width: 58,
      height: 58,
      angle: 45,
      attrs: {
        text: {
          textWrap: {
            text: formatMessage({ id: 'component.plugin-flow.text.condition2' }),
          },
          transform: 'rotate(-45deg)',
        },
      },
      ports: {
        groups: {
          top: {
            position: {
              name: 'top',
              args: {
                dx: -26,
              },
            },
          },
          right: {
            position: {
              name: 'right',
              args: {
                dy: -26,
              },
            },
          },
          bottom: {
            position: {
              name: 'bottom',
              args: {
                dx: 26,
              },
            },
          },
          left: {
            position: {
              name: 'left',
              args: {
                dy: 26,
              },
            },
          },
        },
      },
    });

    this.stencil.load([r1, r3], 'basic');
    this.pluginTypeList.forEach((type) => {
      const plugins = this.plugins
        .filter((plugin) => plugin.type === type)
        .map((plugin) => {
          return graph.createNode({
            shape: FlowGraphShape.plugin,
            attrs: {
              title: {
                text: plugin.name,
              },
              text: {
                text: plugin.name,
              },
            },
          });
        });

      this.stencil.load(plugins, type);
    });
  }

  private static initGraphShape(chart: Model.FromJSONData) {
    if (!chart) {
      return;
    }
    this.graph.fromJSON(chart);
  }

  private static showPorts(ports: NodeListOf<SVGAElement>, show: boolean) {
    // eslint-disable-next-line
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      // eslint-disable-next-line
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  }

  private static initEvent() {
    const { graph } = this;
    const container = document.getElementById('container')!;

    graph.on(
      'node:mouseenter',
      FunctionExt.debounce(() => {
        const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>;
        this.showPorts(ports, true);
      }),
      500,
    );

    graph.on('node:mouseleave', () => {
      const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>;
      this.showPorts(ports, false);
    });

    graph.on('node:dblclick', ({ node }) => {
      if (node.shape === FlowGraphShape.plugin) {
        const name = node.getAttrByPath('text/text') as string;
        if (!name) {
          return;
        }

        this.graph.trigger(FlowGraphEvent.PLUGIN_CHANGE, {
          visible: true,
          id: node.id,
          name,
          data: node.getData(),
        });
      }

      if (node.shape === FlowGraphShape.condition) {
        this.graph.trigger(FlowGraphEvent.CONDITION_CHANGE, {
          id: node.id,
          data: node.getData(),
          visible: true,
        });
      }
    });

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells();
      if (cells.length) {
        graph.removeCells(cells);
      }
    });
  }

  private static getNextCell(id = '', position = ''): Cell.Properties | undefined {
    const { cells = [] } = this.graph.toJSON();
    const cell = cells.find((item) => item.id === id);
    if (!cell) {
      return undefined;
    }

    if (!cell.ports) {
      return undefined;
    }

    const port = cell.ports.items.find((item: { group: string }) => item.group === position);
    if (!port) {
      return undefined;
    }

    const targetCellId = cells.find(
      (item) => item.source?.port === port.id && item.source?.cell === id,
    )?.target.cell;
    const targetCell = cells.find((item) => item.id === targetCellId);
    return targetCell;
  }

  private static getLeafList(currentId = '') {
    let ids: string[] = [];

    const fn = (id: string) => {
      const cell = this.getNextCell(id, 'right');
      if (!cell || !cell.id) {
        return;
      }
      ids = ids.concat(cell.id);
      fn(cell.id);
    };

    fn(currentId);
    return [currentId].concat(ids);
  }

  /**
   * Convert Graph JSON Data to API Request Body Data
   */
  public static convertToData(
    chart: typeof DEFAULT_PLUGIN_FLOW_DATA.chart | undefined = undefined,
  ):
    | {
        chart: {
          cells: Cell.Properties[];
        };
        conf: Record<string, any>;
        rule: Record<string, any>;
      }
    | undefined {
    const data = {
      ...DEFAULT_PLUGIN_FLOW_DATA,
      chart: chart || this.graph.toJSON(),
    };

    const { cells = [] } = data.chart;

    const edgeCells = cells.filter((cell) => cell.shape === 'edge');

    const startCell = cells.find((cell) => cell.shape === FlowGraphShape.start);
    if (!startCell) {
      notification.warn({
        message: formatMessage({ id: 'component.plugin-flow.text.no-start-node' }),
      });
      return;
    }

    const rootCell = cells.find(
      (cell) => cell.shape === 'edge' && cell.source.cell === startCell.id,
    );
    if (!rootCell) {
      notification.warn({
        message: formatMessage({ id: 'component.plugin-flow.text.no-root-node' }),
      });
      return;
    }
    data.rule.root = rootCell.target.cell;

    // Get the ID associated with each node, the relationship between nodes is in edgeCells.
    edgeCells.forEach((edge) => {
      const sourceId = edge.source.cell;
      const targetId = edge.target.cell;

      data.rule[sourceId] = [];

      this.getLeafList(targetId).forEach((id) => {
        const cell = cells.find((item) => item.id === id);
        if (!cell) {
          return;
        }

        if (cell.shape === FlowGraphShape.condition) {
          const nextCell = this.getNextCell(cell.id, 'bottom');
          if (!nextCell) {
            return;
          }
          data.rule[sourceId].push([cell.data, nextCell.id]);
        }

        if (cell.shape === FlowGraphShape.plugin) {
          data.rule[sourceId].push(['', cell.id]);
        }
      });
    });

    // NOTE: Omit empty array, or API will throw error.
    Object.entries(data.rule).forEach(([key, value]) => {
      if (value.length === 0) {
        delete data.rule[key];
      }

      if (key === 'root') {
        return;
      }
      const cell = cells.find((item) => item.id === key);
      if (cell?.shape !== FlowGraphShape.plugin) {
        delete data.rule[key];
      }
    });

    const invalidPluginCell = cells.find(
      (item) => item.shape === FlowGraphShape.plugin && !item.data,
    );
    if (invalidPluginCell) {
      notification.warn({
        message: formatMessage({ id: 'component.plugin-flow.text.without-data' }),
        description: `${formatMessage({
          id: 'component.plugin-flow.text.plugin-without-data.description',
        })}${invalidPluginCell.attrs?.text.text}`,
      });
      return;
    }

    const invalidConditionCell = cells.find(
      (item) => item.shape === FlowGraphShape.condition && !item.data,
    );
    if (invalidConditionCell) {
      notification.warn({
        message: formatMessage({ id: 'component.plugin-flow.text.without-data' }),
        description: `${formatMessage({
          id: 'component.plugin-flow.text.condition-without-configuration',
        })}`,
      });
      return;
    }

    data.conf = {};
    cells
      .filter((item) => item.shape === FlowGraphShape.plugin && item.id)
      .forEach((item) => {
        if (item.id) {
          data.conf[item.id] = {
            name: item.attrs?.text.text,
            conf: item.data,
          };
        }
      });

    // eslint-disable-next-line
    return data;
  }
}

export default FlowGraph;
