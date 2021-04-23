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
import { Graph, Addon, FunctionExt, Model } from '@antv/x6'
import { formatMessage } from 'umi'
import { notification } from 'antd'

import './shapes'
import { DEFAULT_OPINIONS, DEFAULT_STENCIL_OPINIONS, FlowGraphEvent, FlowGraphShape } from '../../constants'

class FlowGraph {
  public static graph: Graph
  private static stencil: Addon.Stencil
  private static pluginTypeList: string[] = []
  private static plugins: PluginComponent.Meta[] = []

  public static init(container: HTMLElement, plugins: PluginComponent.Meta[] = [], data?: Model.FromJSONData) {
    this.graph = new Graph({
      container,
      ...DEFAULT_OPINIONS
    })

    this.plugins = plugins
    this.pluginTypeList = Array.from(new Set(plugins.map(item => item.type)))

    this.initStencil()
    this.initShape()
    this.initGraphShape(data)
    this.initEvent()
    return this.graph
  }

  // NOTE: set cell data according to Cell ID
  public static setData(id: string, data: any): void {
    const cell = this.graph.getCell(id)
    if (cell) {
      cell.setData(data, { overwrite: true })
    }
  }

  // NOTE: Generate groups for stencil
  private static generateGroups(): Addon.Stencil.Group[] {
    const otherGroupList = [{
      name: 'basic',
      title: '通用元件',
      graphHeight: 190,
    }]

    const pluginGroupList = this.pluginTypeList.map(item => {
      const count = this.plugins.filter(plugin => plugin.type === item).length
      return {
        name: item,
        title: formatMessage({ id: `component.plugin.${item}` }),
        layoutOptions: {
          columns: 1,
          marginX: 60,
        },
        graphHeight: count * 82,
      }
    })

    return otherGroupList.concat(pluginGroupList)
  }

  private static initStencil() {
    this.stencil = new Addon.Stencil({
      target: this.graph,
      ...DEFAULT_STENCIL_OPINIONS,
      groups: this.generateGroups()
    })
    const stencilContainer = document.querySelector('#stencil')
    stencilContainer?.appendChild(this.stencil.container)
  }

  private static initShape() {
    const { graph } = this
    const r1 = graph.createNode({
      shape: FlowGraphShape.start,
      attrs: {
        body: {
          rx: 24,
          ry: 24,
        },
        text: {
          textWrap: {
            text: '开始',
          },
        },
      },
    })

    const r2 = graph.createNode({
      shape: FlowGraphShape.end,
      attrs: {
        body: {
          rx: 24,
          ry: 24,
        },
        text: {
          textWrap: {
            text: '结束',
          },
        },
      },
    })

    const r3 = graph.createNode({
      shape: FlowGraphShape.condition,
      width: 58,
      height: 58,
      angle: 45,
      attrs: {
        text: {
          textWrap: {
            text: '条件判断',
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
    })

    this.stencil.load([r1, r2, r3], 'basic')
    this.pluginTypeList.forEach(type => {
      const plugins = this.plugins.filter(plugin => plugin.type === type).map(plugin => {
        return graph.createNode({
          shape: FlowGraphShape.plugin,
          attrs: {
            title: {
              text: plugin.name
            },
            text: {
              text: plugin.name
            }
          }
        })
      })

      this.stencil.load(plugins, type)
    })
  }

  private static initGraphShape(data?: Model.FromJSONData) {
    if (!data) {
      return
    }
    this.graph.fromJSON(data)
  }

  private static showPorts(ports: NodeListOf<SVGAElement>, show: boolean) {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }

  private static initEvent() {
    const { graph } = this
    const container = document.getElementById('container')!

    graph.on(
      'node:mouseenter',
      FunctionExt.debounce(() => {
        const ports = container.querySelectorAll(
          '.x6-port-body',
        ) as NodeListOf<SVGAElement>
        this.showPorts(ports, true)
      }),
      500,
    )

    graph.on('node:mouseleave', () => {
      const ports = container.querySelectorAll(
        '.x6-port-body',
      ) as NodeListOf<SVGAElement>
      this.showPorts(ports, false)
    })

    graph.on('node:dblclick', ({ node }) => {
      console.log(node.shape, node)
      if (node.shape === FlowGraphShape.plugin) {
        const name = node.getAttrByPath('text/text') as string
        if (!name) {
          return
        }

        this.graph.trigger(FlowGraphEvent.PLUGIN_CHANGE, {
          visible: true,
          id: node.id,
          name,
          data: node.getData()
        })
      }

      if (node.shape === FlowGraphShape.condition) {
        this.graph.trigger(FlowGraphEvent.CONDITION_CHANGE, {
          id: node.id,
          data: node.getData(),
          visible: true
        })
      }
    })

    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.removeCells(cells)
      }
    })
  }

  private static getNextCell(id = '', position = '') {
    const { cells = [] } = this.graph.toJSON()
    const cell = cells.find(item => item.id === id)
    if (!cell) {
      return
    }

    if (!cell.ports) {
      return undefined
    }

    const port = cell.ports.items.find((item: { group: string }) => item.group === position)
    if (!port) {
      return undefined
    }

    const targetCellId = cells.find(cell => cell.source?.port === port.id && cell.source?.cell === id)?.target.cell
    const targetCell = cells.find(cell => cell.id === targetCellId)
    return targetCell
  }

  private static getLeafList(id = '') {
    let ids: string[] = []

    const fn = (id: string) => {
      const cell = this.getNextCell(id, "right")
      if (!cell || !cell.id) {
        return
      }
      ids = ids.concat(cell.id);
      fn(cell.id)
    }

    fn(id)
    return [id].concat(ids)
  }

  /**
   * Convert Graph JSON Data to API Request Body Data
  */
  public static convertToData() {
    const data: {
      chart: Model.FromJSONData;
      conf: Record<string, any>;
      rule: Record<string, any>;
    } = {
      chart: {},
      conf: {},
      rule: {
        root: ""
      }
    }

    const { cells = [] } = this.graph.toJSON()

    cells.forEach(cell => {
      const { shape, id } = cell
      if (!id) {
        return
      }

      if (shape === FlowGraphShape.plugin) {
        if (cell.data) {
          data.conf[id] = cell.data
        } else {
          notification.warn({
            message: "请检查节点配置",
            description: `节点 ${id} 未配置数据`
          })
        }
        data.rule[id] = []
      }
    })

    const edgeCells = cells.filter(cell => cell.shape === 'edge')

    const startCell = cells.find(cell => cell.shape === 'flow-chart-start-rect')
    if (!startCell) {
      notification.warn({
        message: "请绑定开始节点"
      })
      return
    }

    if (!startCell) {
      notification.warn({
        message: "请绑定结束节点"
      })
      return
    }

    const rootCell = cells.find(cell => cell.shape === 'edge' && cell.source.cell === startCell.id)
    if (!rootCell) {
      notification.warn({
        message: "未能找到根节点"
      })
      return
    }
    data.rule.root = rootCell.target.cell

    // Get the ID associated with each node, the relationship between nodes is in edgeCells.
    edgeCells.forEach(edge => {
      const sourceId = edge.source.cell
      const targetId = edge.target.cell

      data.rule[sourceId] = []

      this.getLeafList(targetId).forEach(id => {
        const cell = cells.find(item => item.id === id)
        if (!cell) {
          return
        }

        if (cell.shape === FlowGraphShape.condition) {
          const nextCell = this.getNextCell(cell.id, "bottom");
          if (!nextCell) {
            return
          }
          data.rule[sourceId].push([cell.data, nextCell.id])
        }

        if (cell.shape === FlowGraphShape.plugin) {
          data.rule[sourceId].push(['', cell.id])
        }
      })
    })

    // NOTE: Omit empty array, or API will throw error.
    Object.entries(data.rule).forEach(([key, value]) => {
      if (value.length === 0) {
        delete data.rule[key]
      }

      if (key === 'root') {
        return
      }
      const cell = cells.find(item => item.id === key)
      if (cell?.shape !== FlowGraphShape.plugin) {
        delete data.rule[key]
      }
    })

    console.log(data.rule)
    return data
  }
}

export default FlowGraph
