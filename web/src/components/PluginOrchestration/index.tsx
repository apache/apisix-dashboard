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
import { Form, Input, Button, Divider, Card, Select } from 'antd';
import { withTheme } from '@rjsf/core';
import { useIntl } from 'umi'

// @ts-ignore
import { Theme as AntDTheme } from '@rjsf/antd';

import { Page, SidebarItem } from './components';
import { INIT_CHART, PLUGINS_PORTS, CONDITION_PORTS } from './constants';
import { SMessage, SContent, SSidebar } from './DrawPluginStyle';
import { PortCustom, NodeInnerCustom } from './customConfig';
import { fetchList } from './service';
import { PluginOrchestrationModule } from './typing';

export * from './transform';

export enum PanelType {
  Plugin,
  Condition,
  Default,
}

type Props = {
  data: any;
  onChange(data: object): void;
  readonly: boolean;
};

const PluginForm = withTheme(AntDTheme);

const LAYOUT = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const TAIL_LAYOUT = {
  wrapperCol: { offset: 8, span: 16 },
};

const SelectedSidebar: React.FC<Props> = ({ data = {}, onChange, readonly = false }) => {
  const [form] = Form.useForm();
  const [chart, setChart] = useState(cloneDeep(Object.keys(data).length ? data : INIT_CHART));
  const [schema, setSchema] = useState<any>();
  const [selectedType, setSelectedType] = useState<PanelType>(PanelType.Default);
  const [pluginList, setPluginList] = useState<PluginOrchestrationModule.Meta[]>([]);
  const [pluginCategory, setPluginCategory] = useState('All');
  const [showList, setShowList] = useState<string[]>();
  const [typeList, setTypeList] = useState<string[]>([]);

  const { formatMessage } = useIntl();

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
          const plugin = pluginList.find(item => item.name === name);
          if (plugin) {
            setSchema(plugin.schema);
          }
        }
      }
      onChange(newChart);
      return newChart;
    };
    return clonedObj;
  }, {}) as IFlowChartCallbacks;

  const firstUpperCase = ([first, ...rest]: string) => first.toUpperCase() + rest.join("");
  useEffect(() => {
    // eslint-disable-next-line no-shadow
    fetchList().then((data) => {
      const categoryList: string[] = [];
      data.forEach(item => {
        if (!categoryList.includes(firstUpperCase(item.type))) {
          categoryList.push(firstUpperCase(item.type));
        }
      });
      setTypeList(['All', ...categoryList.sort()]);
      setPluginList(data);
      setShowList(data.map(item => item.name).sort());
    });
  }, []);

  const renderSidebar = () => {
    if (selectedType === PanelType.Condition) {
      form.setFieldsValue({ condition: getCustomDataById().name });
      return (
        <SMessage>
          <Form
            {...LAYOUT}
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
              label={formatMessage({ id: 'page.siderBar.form.label.panelType.condition' })}
              name="condition"
              rules={[{ required: true, message: formatMessage({ id: 'page.siderBar.form.rule.panelType.condition' }) }]}
            >
              <Input />
            </Form.Item>
            <Form.Item {...TAIL_LAYOUT}>
              <Button type="primary" htmlType="submit">
                {formatMessage({ id: "page.siderBar.button.submit" })}
              </Button>
            </Form.Item>
          </Form>
        </SMessage>
      );
    }
    if (selectedType === PanelType.Plugin && schema) {
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
            {/* NOTE: Leave blank to hide the Submit button */}
            <Fragment />

            <Button type="primary" htmlType="submit">
              {formatMessage({ id: "page.siderBar.button.submit" })}
            </Button>
          </PluginForm>
        </SMessage>
      );
    }

    return (
      <SSidebar>
        <SMessage style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatMessage({ id: 'page.siderBar.tips' })}</SMessage>
        <Divider style={{ margin: '0px' }} />
        <SidebarItem
          type={formatMessage({ id: 'page.siderBar.form.label.panelType.condition' })}
          ports={CONDITION_PORTS}
          properties={{
            customData: {
              type: PanelType.Condition,
            },
          }}
        />
        <Divider orientation="left">{formatMessage({ id: 'page.siderBar.plugin' })}</Divider>
        <Select
          showSearch
          placeholder={formatMessage({ id: "page.siderBar.form.label.panelType.plugin" })}
          optionFilterProp="children"
          defaultValue={pluginCategory}
          onChange={(value) => {
            setPluginCategory(value);
            if (value === 'All') {
              setShowList(pluginList.map(item => item.name).sort());
              return;
            }
            setShowList(pluginList.filter(item => item.type === value.toLowerCase()).map(item => item.name).sort());
          }}
          filterOption={(input, option) =>
            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {typeList.map((item) => (
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
