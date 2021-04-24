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
import React, { useEffect, useState } from 'react'
import { Modal, Form, Input } from 'antd'
import { Cell } from '@antv/x6'

import FlowGraph from './components/FlowGraph'
import Toolbar from './components/Toolbar'
import { DEFAULT_CONDITION_PROPS, DEFAULT_PLUGIN_PROPS, DEFAULT_STENCIL_WIDTH, DEFAULT_TOOLBAR_HEIGHT, FlowGraphEvent } from './constants'
import styles from './style.less'
import ConfigPanel from './components/ConfigPanel'
import PluginDetail from '../Plugin/PluginDetail'
import { fetchList } from '../Plugin/service'

type Props = {
  chart: {
    cells: Cell.Properties[];
  }
}

type PluginProps = {
  id: string;
  name: string;
  visible: boolean;
  data: any;
}

type ConditionProps = {
  id: string;
  visible: boolean;
  data: string;
}

const PluginFlow: React.FC<Props> = ({ chart }) => {
  // NOTE: To prevent from graph is not initialized
  const [isReady, setIsReady] = useState(false)
  const [plugins, setPlugins] = useState<PluginComponent.Meta[]>([])

  const [pluginProps, setPluginProps] = useState<PluginProps>(DEFAULT_PLUGIN_PROPS)
  const [conditionProps, setConditionProps] = useState<ConditionProps>(DEFAULT_CONDITION_PROPS)

  const getContainerSize = () => {
    const leftSidebar = document.querySelector('aside.ant-layout-sider')
    const blankSpaceWidth = 24 * 4

    const globalHeaderHeight = 48
    const pageHeaderHeight = 72
    const otherHeight = 191

    const width = document.body.offsetWidth - (leftSidebar?.clientWidth || 0) - blankSpaceWidth - DEFAULT_STENCIL_WIDTH
    const height = document.body.offsetHeight - globalHeaderHeight - pageHeaderHeight - otherHeight

    return {
      width,
      height: height < 800 ? 800 : height
    }
  }

  useEffect(() => {
    if (!plugins.length) {
      return
    }

    const container = document.getElementById("container")
    if (!container) {
      return
    }

    const sidebar = document.querySelector('.ant-pro-sider-collapsed-button')

    const graph = FlowGraph.init(container, plugins, chart);
    (window as any).graph = graph
    setIsReady(true)

    const stencilContainer = document.querySelector('#stencil') as HTMLElement

    const handleResize = () => {
      const { width, height } = getContainerSize()
      graph.resize(width, height)

      stencilContainer.style.height = `${height + DEFAULT_TOOLBAR_HEIGHT}px`
      stencilContainer.style.width = `${DEFAULT_STENCIL_WIDTH}px`
    }

    const handleLeftSidebarResize = () => {
      setTimeout(() => {
        handleResize()
      }, 200)
    }

    handleResize()

    graph.on(FlowGraphEvent.PLUGIN_CHANGE, setPluginProps)
    graph.on(FlowGraphEvent.CONDITION_CHANGE, (props: ConditionProps) => {
      setConditionProps(props)
    })

    window.addEventListener("resize", handleResize)
    sidebar?.addEventListener('click', handleLeftSidebarResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      sidebar?.removeEventListener('click', handleLeftSidebarResize)
    }
  }, [plugins])

  useEffect(() => {
    fetchList().then(data => setPlugins(data))
  }, [])

  return (
    <React.Fragment>
      <div className={styles.container}>
        <div id="stencil" className={styles.stencil} />
        <div className={styles.panel}>
          <div className={styles.toolbar}>{isReady && <Toolbar />}</div>
          <div id="container" className={styles.flow}></div>
        </div>
        <div className={styles.config}>{isReady && <ConfigPanel />}</div>
      </div>
      {
        pluginProps.visible && (
          <PluginDetail
            schemaType="route"
            name={pluginProps.name}
            visible={pluginProps.visible}
            pluginList={plugins}
            initialData={{
              // NOTE: We use {PluginName: data} because initialData is all plugins' data
              [pluginProps.name]: pluginProps.data
            }}
            onClose={() => {
              setPluginProps(DEFAULT_PLUGIN_PROPS)
            }}
            onChange={({ formData, codemirrorData, shouldDelete }) => {
              if (shouldDelete) {
                FlowGraph.graph.removeCell(pluginProps.id)
              } else {
                const disable = !formData.disable
                FlowGraph.setData(pluginProps.id, { ...codemirrorData, disable })
              }
              setPluginProps(DEFAULT_PLUGIN_PROPS)
            }}
          />
        )
      }

      <Modal
        visible={conditionProps.visible}
        title="配置判断条件"
        onOk={() => {
          FlowGraph.setData(conditionProps.id, conditionProps.data);
          setConditionProps(DEFAULT_CONDITION_PROPS)
        }}
      >
        <Form.Item label="判断条件" style={{ marginBottom: 0 }} tooltip="节点的判断条件。例如：code == 503">
          <Input
            value={conditionProps.data}
            placeholder="请输入判断条件"
            onChange={e => {
              setConditionProps({
                ...conditionProps,
                data: e.target.value
              })
            }}
          />
        </Form.Item>
      </Modal>
    </React.Fragment>
  )
}

export default PluginFlow
