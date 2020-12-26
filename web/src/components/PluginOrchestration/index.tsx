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
import React, { Fragment, useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';
import { FlowChart, IFlowChartCallbacks } from '@mrblenny/react-flow-chart';
import * as actions from '@mrblenny/react-flow-chart/src/container/actions';
import { Form, Input, Button, Collapse, Divider, Card, Select } from 'antd';
import { withTheme } from '@rjsf/core';
import { PLUGIN_MAPPER_SOURCE, PluginPageType, PluginPage } from '@api7-dashboard/plugin';

// @ts-ignore
import { Theme as AntDTheme } from '@rjsf/antd';
import { JSONSchema7 } from 'json-schema';

import { Page, SidebarItem } from './components';
import { INIT_CHART, PLUGINS_PORTS, CONDITION_PORTS, CATEGOTY_OPTIONS } from './constants';
import { SMessage, SContent, SSidebar } from './DrawPluginStyle';
import { PortCustom, NodeInnerCustom } from './customConfig';
import { fetchPluginList, fetchPluginSchema } from './service';

export * from './transform';

export enum PanelType {
  Plugin,
  Condition,
  Default,
}

type Props = {
  data: any;
  onChange(data: PluginPageType.DrawData): void;
  readonly: boolean;
};

const { Panel } = Collapse;

const PluginForm = withTheme(AntDTheme);

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const SelectedSidebar: React.FC<Props> = ({ data = {}, onChange, readonly = false }) => {
  const [form] = Form.useForm();
  const [chart, setChart] = useState(cloneDeep(Object.keys(data).length ? data : INIT_CHART));
  const [schema, setSchema] = useState<JSONSchema7>();
  const [selectedType, setSelectedType] = useState<PanelType>(PanelType.Default);
  const [pluginCategoryList, setPluginCategoryList] = useState({});
  const [pluginCategory, setPluginCategory] = useState('All');
  const [showList, setShowList] = useState<string[]>();

  const getCustomDataById = (id = chart.selected.id) => {
    if (!id || !chart.nodes[id].properties) {
      return {};
    }
    return chart.nodes[id].properties.customData;
  };

  const stateActionCallbacks = Object.keys(actions).reduce((obj, key) => {
    const clonedObj = cloneDeep(obj);
    clonedObj[key] = (...args: any) => {
      const action = actions[key];
      const newChartTransformer = action(...args);
      const newChart = newChartTransformer(chart);
      if (
        ['onLinkMouseEnter', 'onLinkMouseLeave', 'onNodeMouseEnter', 'onNodeMouseLeave'].includes(
          key,
        )
      ) {
        return newChart;
      }

      if (key === 'onDragCanvasStop') {
        setSelectedType(PanelType.Default);
        return newChart;
      }

      setChart({ ...chart, ...newChart });
      if (['onCanvasDrop', 'onNodeClick'].includes(key)) {
        const { type, name } = getCustomDataById(args.nodeId);
        setSelectedType(type);
        if (type === PanelType.Plugin && name) {
          fetchPluginSchema(name).then(({ data }) => setSchema(data));
        }
      }
      onChange(newChart);
      return newChart;
    };
    return clonedObj;
  }, {}) as IFlowChartCallbacks;

  useEffect(() => {
    fetchPluginList().then((r) => {
      const data: Record<string, PluginPageType.PluginMapperItem[]> = {};
      const list = {
        All: r.data,
      };
      r.data.forEach((name) => {
        const plugin = PLUGIN_MAPPER_SOURCE[name] || {};
        const { category = 'Other', hidden = false } = plugin;
        if (!data[category]) {
          data[category] = [];
        }
        if (!hidden) {
          data[category] = data[category].concat({
            ...plugin,
            name,
          });
        }
      });
      Object.keys(data).map((category) => {
        list[category] = data[category]
          .sort((a, b) => {
            return (a.priority || 9999) - (b.priority || 9999);
          })
          .map((item) => item.name);
      });
      setShowList(r.data.sort());
      setPluginCategoryList(list);
    });
  }, []);

  const renderSidebar = () => {
    if (selectedType === PanelType.Condition) {
      form.setFieldsValue({ condition: getCustomDataById().name });
      return (
        <SMessage>
          <Form
            {...layout}
            name="basic"
            form={form}
            onFinish={(values) => {
              const clonedChart = cloneDeep(chart);
              clonedChart.nodes[chart.selected.id!].properties.customData.name = values.condition;
              setChart(clonedChart);
              onChange(clonedChart);
              setSelectedType(PanelType.Default);
            }}
          >
            <Form.Item
              label="判断条件"
              name="condition"
              rules={[{ required: true, message: '请输入判断条件!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </SMessage>
      );
    }
    if (selectedType === PanelType.Plugin && schema) {
      const { name } = getCustomDataById();
      if (PLUGIN_MAPPER_SOURCE[name]?.noConfiguration) {
        return (
          <div style={{ width: '100%', marginTop: '150px', textAlign: 'center' }}>
            插件 {name} 不需要配置
          </div>
        );
      }

      return (
        <SMessage style={{ overflow: 'scroll' }}>
          <PluginForm
            schema={schema}
            liveValidate
            formData={getCustomDataById().data || {}}
            showErrorList={false}
            onSubmit={({ formData }) => {
              const clonedChart = cloneDeep(chart);
              clonedChart.nodes[chart.selected.id!].properties.customData.data = formData;
              setChart(clonedChart);
              onChange(clonedChart);
              setSelectedType(PanelType.Default);
            }}
          >
            {/* NOTE: 留空，用于隐藏 Submit 按钮 */}
            <Fragment />

            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </PluginForm>
        </SMessage>
      );
    }

    return (
      <SSidebar>
        <SMessage style={{ fontSize: '16px', fontWeight: 'bold' }}>拖动所需组件至面板</SMessage>
        <Divider style={{ margin: '0px' }} />
        <SidebarItem
          type="判断条件"
          ports={CONDITION_PORTS}
          properties={{
            customData: {
              type: PanelType.Condition,
            },
          }}
        />
        <Divider orientation="left">插件</Divider>
        <Select
          showSearch
          placeholder="插件分类"
          optionFilterProp="children"
          defaultValue={pluginCategory}
          onChange={(values) => {
            setPluginCategory(values);
            setShowList(pluginCategoryList[values]);
          }}
          filterOption={(input, option) =>
            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {CATEGOTY_OPTIONS.map((item) => (
            <Select.Option value={item}>{item}</Select.Option>
          ))}
        </Select>
        <Card size="small" title={pluginCategory} style={{ height: 'unset' }}>
          <div
            style={{
              overflowY: 'scroll',
              height: '500px',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
            }}
          >
            {showList &&
              showList.map((name) => {
                return (
                  <SidebarItem
                    key={name}
                    type={name}
                    ports={PLUGINS_PORTS}
                    properties={{
                      customData: {
                        type: PanelType.Plugin,
                        name,
                      },
                    }}
                  />
                );
              })}
          </div>
        </Card>
      </SSidebar>
    );
  };
  return (
    <Page>
      <SContent>
        <FlowChart
          chart={chart}
          callbacks={stateActionCallbacks}
          config={{
            zoom: { wheel: { disabled: true } },
            readonly,
          }}
          Components={{
            Port: PortCustom,
            NodeInner: NodeInnerCustom,
          }}
        />
      </SContent>
      {Boolean(!readonly) && <SSidebar>{renderSidebar()}</SSidebar>}
    </Page>
  );
};

export default SelectedSidebar;
