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
import React, { useState } from 'react';
import { Button, Table, Modal, Form, Select, Input, Space } from 'antd';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

interface Props extends RouteModule.Data {}

const MatchingRulesView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { advancedMatchingRules } = data.step1Data;

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<RouteModule.ModalType>('CREATE');
  const [namePlaceholder, setNamePlaceholder] = useState('');
  const [modalForm] = Form.useForm();

  const { Option } = Select;

  const { formatMessage } = useIntl();

  const onOk = () => {
    modalForm.validateFields().then((value) => {
      if (mode === 'EDIT') {
        const key = modalForm.getFieldValue('key');
        onChange({
          ...data.step1Data,
          advancedMatchingRules: advancedMatchingRules.map((rule) => {
            if (rule.key === key) {
              return { ...(value as RouteModule.MatchingRule), key };
            }
            return rule;
          }),
        });
      } else {
        const rule = {
          ...(value as RouteModule.MatchingRule),
          key: Math.random().toString(36).slice(2),
        };
        onChange({ ...data.step1Data, advancedMatchingRules: advancedMatchingRules.concat(rule) });
      }
      modalForm.resetFields();
      setVisible(false);
    });
  };

  const handleEdit = (record: RouteModule.MatchingRule) => {
    setMode('EDIT');
    setVisible(true);
    modalForm.setFieldsValue(record);
  };

  const handleRemove = (key: string) => {
    onChange({
      ...data.step1Data,
      advancedMatchingRules: advancedMatchingRules.filter((item) => item.key !== key),
    });
  };

  const columns = [
    {
      title: formatMessage({ id: 'route.match.parameter.position' }),
      key: 'position',
      render: (text: RouteModule.MatchingRule) => {
        let renderText;
        switch (text.position) {
          case 'http':
            renderText = formatMessage({ id: 'route.match.http.request.header' });
            break;
          case 'arg':
            renderText = formatMessage({ id: 'route.match.request.parameter' });
            break;
          case 'cookie':
            renderText = 'Cookie';
            break;
          default:
            renderText = '';
        }
        return renderText;
      },
    },
    {
      title: formatMessage({ id: 'route.match.parameter.name' }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({ id: 'route.match.operational.character' }),
      key: 'operator',
      render: (text: RouteModule.MatchingRule) => {
        let renderText;
        switch (text.operator) {
          case '==':
            renderText = formatMessage({ id: 'route.match.equal' });
            break;
          case '~=':
            renderText = formatMessage({ id: 'route.match.unequal' });
            break;
          case '>':
            renderText = formatMessage({ id: 'route.match.greater.than' });
            break;
          case '<':
            renderText = formatMessage({ id: 'route.match.less.than' });
            break;
          case '~~':
            renderText = formatMessage({ id: 'route.match.regex.match' });
            break;
          default:
            renderText = '';
        }
        return renderText;
      },
    },
    {
      title: formatMessage({ id: 'route.match.parameter.value' }),
      dataIndex: 'value',
      key: 'value',
    },
    disabled
      ? {}
      : {
          title: formatMessage({ id: 'route.match.operation' }),
          key: 'action',
          render: (_: any, record: RouteModule.MatchingRule) => (
            <Space size="middle">
              <a onClick={() => handleEdit(record)}>{formatMessage({ id: 'route.match.edit' })}</a>
              <a onClick={() => handleRemove(record.key)}>
                {formatMessage({ id: 'route.match.delete' })}
              </a>
            </Space>
          ),
        },
  ];

  const renderModal = () => (
    <Modal
      title={
        mode === 'EDIT'
          ? formatMessage({ id: 'route.match.edit.rule' })
          : formatMessage({ id: 'route.match.create.rule' })
      }
      centered
      visible
      onOk={onOk}
      onCancel={() => {
        setVisible(false);
        modalForm.resetFields();
      }}
      okText={formatMessage({ id: 'route.match.confirm' })}
      cancelText={formatMessage({ id: 'route.match.cancel' })}
      destroyOnClose
    >
      <Form form={modalForm} labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
        <Form.Item
          label={formatMessage({ id: 'route.match.parameter.position' })}
          name="position"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'route.match.select.parameter.position' }),
            },
          ]}
        >
          <Select
            onChange={(value) => {
              if (value === 'http') {
                setNamePlaceholder(formatMessage({ id: 'route.match.request.header.example' }));
              } else {
                setNamePlaceholder(formatMessage({ id: 'route.match.parameter.name.example' }));
              }
            }}
          >
            <Option value="http">{formatMessage({ id: 'route.match.http.request.header' })}</Option>
            <Option value="arg">{formatMessage({ id: 'route.match.request.parameter' })}</Option>
            <Option value="cookie">Cookie</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'route.match.parameter.name' })}
          name="name"
          rules={[
            { required: true, message: formatMessage({ id: 'route.match.input.parameter.name' }) },
            {
              pattern: new RegExp(/^([a-zA-Z][a-zA-Z0-9_-]*$)/, 'g'),
              message: formatMessage({ id: 'route.match.parameter.name.rule' }),
            },
          ]}
          extra={formatMessage({ id: 'route.match.rule' })}
        >
          <Input placeholder={namePlaceholder} />
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'route.match.operational.character' })}
          name="operator"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'route.match.choose.operational.character' }),
            },
          ]}
        >
          <Select>
            <Option value="==">{formatMessage({ id: 'route.match.equal' })}</Option>
            <Option value="~=">{formatMessage({ id: 'route.match.unequal' })}</Option>
            <Option value=">">{formatMessage({ id: 'route.match.greater.than' })}</Option>
            <Option value="<">{formatMessage({ id: 'route.match.less.than' })}</Option>
            <Option value="~~">{formatMessage({ id: 'route.match.regex.match' })}</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'route.match.value' })}
          name="value"
          rules={[
            { required: true, message: formatMessage({ id: 'route.match.input.parameter.value' }) },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <PanelSection title={formatMessage({ id: 'route.match.advanced.match.rule' })}>
      {!disabled && (
        <Button
          onClick={() => {
            setMode('CREATE');
            setVisible(true);
          }}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          {formatMessage({ id: 'route.match.create' })}
        </Button>
      )}
      <Table key="table" bordered dataSource={advancedMatchingRules} columns={columns} />
      {/* NOTE: tricky way, switch visible on Modal component will ocure error */}
      {visible ? renderModal() : null}
    </PanelSection>
  );
};

export default MatchingRulesView;
