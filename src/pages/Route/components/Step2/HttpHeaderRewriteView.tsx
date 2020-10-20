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
import Form from 'antd/es/form';
import { Button, Table, Space, Modal, Input, Select } from 'antd';
import { useIntl } from 'umi';
import { PanelSection } from '@api7-dashboard/ui';

const HttpHeaderRewriteView: React.FC<RouteModule.Step2PassProps> = ({
  upstreamHeaderList = [],
  disabled,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [mode, setMode] = useState<RouteModule.ModalType>('CREATE');
  const [showModalValue, setShowModalValue] = useState(true);
  const { formatMessage } = useIntl();

  const handleEdit = (record: RouteModule.UpstreamHeader) => {
    setMode('EDIT');
    setVisible(true);
    modalForm.setFieldsValue(record);
  };
  const handleRemove = (key: string) => {
    onChange({
      action: 'upstreamHeaderListChange',
      data: upstreamHeaderList.filter((item) => item.key !== key),
    });
  };

  const columns = [
    {
      title: formatMessage({ id: 'page.route.httpHeaderName' }),
      dataIndex: 'header_name',
      key: 'header_name',
    },
    {
      title: formatMessage({ id: 'page.route.httpAction' }),
      dataIndex: 'header_action',
      key: 'header_action',
      render: (action: 'override' | 'remove') => {
        return action === 'override'
          ? formatMessage({ id: 'page.route.httpOverrideOrCreate' })
          : formatMessage({ id: 'component.global.delete' });
      },
    },
    {
      title: formatMessage({ id: 'page.route.value' }),
      dataIndex: 'header_value',
      key: 'header_value',
    },
    disabled
      ? {}
      : {
          title: formatMessage({ id: 'component.global.operation' }),
          key: 'action',
          render: (_: any, record: RouteModule.UpstreamHeader) => (
            <Space size="middle">
              <a
                onClick={() => {
                  handleEdit(record);
                }}
              >
                {formatMessage({ id: 'component.global.edit' })}
              </a>
              <a
                onClick={() => {
                  handleRemove(record.key);
                }}
              >
                {formatMessage({ id: 'component.global.delete' })}
              </a>
            </Space>
          ),
        },
  ];

  const renderModal = () => {
    const handleOk = () => {
      modalForm.validateFields().then((value) => {
        if (mode === 'EDIT') {
          const key = modalForm.getFieldValue('key');
          onChange({
            action: 'upstreamHeaderListChange',
            data: upstreamHeaderList.map((item) => {
              if (item.key === key) {
                return { ...(value as RouteModule.UpstreamHeader), key };
              }
              return item;
            }),
          });
        } else {
          onChange({
            action: 'upstreamHeaderListChange',
            data: upstreamHeaderList.concat({
              ...(value as RouteModule.UpstreamHeader),
              key: Math.random().toString(36).slice(2),
            }),
          });
        }
        modalForm.resetFields();
        setVisible(false);
      });
    };

    return (
      <Modal
        title={
          mode === 'EDIT'
            ? formatMessage({ id: 'component.global.edit' })
            : formatMessage({ id: 'component.global.operation' })
        }
        centered
        visible
        onOk={handleOk}
        onCancel={() => {
          setVisible(false);
          modalForm.resetFields();
        }}
        okText={formatMessage({ id: 'component.global.confirm' })}
        cancelText={formatMessage({ id: 'component.global.cancel' })}
        destroyOnClose
      >
        <Form form={modalForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label={formatMessage({ id: 'page.route.httpHeaderName' })}
            name="header_name"
            rules={[
              {
                required: true,
                message: `${formatMessage({ id: 'component.global.pleaseEnter' })} ${formatMessage({
                  id: 'page.route.httpHeaderName',
                })}`,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'page.route.httpAction' })}
            name="header_action"
            rules={[
              {
                required: true,
                message: `${formatMessage({
                  id: 'component.global.pleaseChoose',
                })} ${formatMessage({ id: 'page.route.httpAction' })}`,
              },
            ]}
          >
            <Select onChange={(e) => setShowModalValue(e === 'override')}>
              <Select.Option value="override">
                {formatMessage({ id: 'page.route.httpOverrideOrCreate' })}
              </Select.Option>
              <Select.Option value="remove">
                {formatMessage({ id: 'component.global.delete' })}
              </Select.Option>
            </Select>
          </Form.Item>
          {showModalValue && (
            <Form.Item
              label={formatMessage({ id: 'page.route.value' })}
              name="header_value"
              rules={[
                {
                  required: true,
                  message: `${formatMessage({
                    id: 'component.global.pleaseEnter',
                  })} ${formatMessage({ id: 'page.route.value' })}`,
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  };

  return (
    <PanelSection
      title={formatMessage({ id: 'page.route.panelSection.title.httpOverrideRequestHeader' })}
    >
      {!disabled && (
        <Button
          onClick={() => {
            setMode('CREATE');
            setVisible(true);
            modalForm.setFieldsValue({ header_action: 'override' });
          }}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          {formatMessage({ id: 'component.global.operation' })}
        </Button>
      )}
      <Table key="table" bordered dataSource={upstreamHeaderList} columns={columns} />
      {visible ? renderModal() : null}
    </PanelSection>
  );
};

export default HttpHeaderRewriteView;
