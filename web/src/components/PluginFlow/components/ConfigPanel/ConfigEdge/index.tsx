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
import React, { useEffect, useState, useRef } from 'react'
import { Tabs, Row, Col, Input, Slider, Select } from 'antd'
import { Cell, Edge } from '@antv/x6'
import { useIntl } from 'umi'

import FlowGraph from '../../FlowGraph'

const { TabPane } = Tabs

interface IProps {
  id: string
}
interface EdgeAttrs {
  stroke: string
  strokeWidth: number
  connector: string
}

export default function (props: IProps) {
  const { formatMessage } = useIntl()
  const { id } = props
  const [attrs, setAttrs] = useState<EdgeAttrs>({
    stroke: '#5F95FF',
    strokeWidth: 1,
    connector: 'normal',
  })
  const cellRef = useRef<Cell>()

  const setAttr = (key: string, val: any) => {
    setAttrs((prev) => ({
      ...prev,
      [key]: val,
    }))
  }

  useEffect(() => {
    if (id) {
      const { graph } = FlowGraph
      const cell = graph.getCellById(id) as Edge
      if (!cell || !cell.isEdge()) {
        return
      }
      cellRef.current = cell

      const connector = cell.getConnector() || {
        name: 'normal',
      }
      setAttr('stroke', cell.attr('line/stroke'))
      setAttr('strokeWidth', cell.attr('line/strokeWidth'))
      setAttr('connector', connector.name)
    }
  }, [id])

  const onStrokeChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value
    setAttr('stroke', val)
    cellRef.current!.attr('line/stroke', val)
  }

  const onStrokeWidthChange = (val: number) => {
    setAttr('strokeWidth', val)
    cellRef.current!.attr('line/strokeWidth', val)
  }

  const onConnectorChange = (val: string) => {
    setAttr('connector', val)
    const cell = cellRef.current as Edge
    cell.setConnector(val)
  }

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab={formatMessage({id: 'component.plugin-flow.text.line'})} key="1">
        <Row align="middle">
          <Col span={8}>Width</Col>
          <Col span={12}>
            <Slider
              min={1}
              max={5}
              step={1}
              value={attrs.strokeWidth}
              onChange={onStrokeWidthChange}
            />
          </Col>
          <Col span={2}>
            <div className="result">{attrs.strokeWidth}</div>
          </Col>
        </Row>
        <Row align="middle">
          <Col span={8}>Color</Col>
          <Col span={14}>
            <Input
              type="color"
              value={attrs.stroke}
              style={{ width: '100%' }}
              onChange={onStrokeChange}
            />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={8}>Connector</Col>
          <Col span={14}>
            <Select
              style={{ width: '100%' }}
              value={attrs.connector}
              onChange={onConnectorChange}
            >
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="smooth">Smooth</Select.Option>
              <Select.Option value="rounded">Rounded</Select.Option>
              <Select.Option value="jumpover">Jumpover</Select.Option>
            </Select>
          </Col>
        </Row>
      </TabPane>
    </Tabs>
  )
}
