/*
* MIT License

* Copyright (c) 2019 Alipay.inc

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
import React, { useEffect, useState } from 'react'
import ConfigGrid from './ConfigGrid'
import ConfigNode from './ConfigNode'
import ConfigEdge from './ConfigEdge'
import FlowGraph from '../FlowGraph'
import { useGridAttr } from './hooks'
import styles from './index.less'

export enum CONFIG_TYPE {
  GRID,
  NODE,
  EDGE,
}

const ConfigPanel: React.FC = () => {
  const [type, setType] = useState<CONFIG_TYPE>(CONFIG_TYPE.GRID)
  const [id, setId] = useState('')
  const { gridAttrs, setGridAttr } = useGridAttr()

  useEffect(() => {
    const { graph } = FlowGraph
    graph.on('blank:click', () => {
      setType(CONFIG_TYPE.GRID)
    })
    graph.on('cell:click', ({ cell }) => {
      setType(cell.isNode() ? CONFIG_TYPE.NODE : CONFIG_TYPE.EDGE)
      setId(cell.id)
    })
  }, [])

  return (
    <div className={styles.config}>
      {type === CONFIG_TYPE.GRID && (
        <ConfigGrid attrs={gridAttrs} setAttr={setGridAttr} />
      )}
      {type === CONFIG_TYPE.NODE && <ConfigNode id={id} />}
      {type === CONFIG_TYPE.EDGE && <ConfigEdge id={id} />}
    </div>
  )
}

export default ConfigPanel
