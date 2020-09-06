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

interface Props extends RouteModule.Data {}

const HttpHeaderRewriteView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { upstreamHeaderList = [] } = data.step2Data;
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
    onChange({ upstreamHeaderList: upstreamHeaderList.filter((item) => item.key !== key) });
  };

  const columns = [
    {
      title: formatMessage({ id: 'route.http.request.header.name' }),
      dataIndex: 'header_name',
      key: 'header_name',
    },
    {
      title: formatMessage({ id: 'route.http.action' }),
      dataIndex: 'header_action',
      key: 'header_action',
      render: (action: 'override' | 'remove') => {
        return action === 'override'
          ? formatMessage({ id: 'route.http.override.or.create' })
          : formatMessage({ id: 'route.http.delete' });
      },
    },
    {
      title: formatMessage({ id: 'route.http.value' }),
      dataIndex: 'header_value',
      key: 'header_value',
    },
    disabled
      ? {}
      : {
          title: formatMessage({ id: 'route.http.operation' }),
          key: 'action',
          render: (_: any, record: RouteModule.UpstreamHeader) => (
            <Space size="middle">
              <a
                onClick={() => {
                  handleEdit(record);
                }}
              >
                {formatMessage({ id: 'route.http.edit' })}
              </a>
              <a
                onClick={() => {
                  handleRemove(record.key);
                }}
              >
                {formatMessage({ id: 'route.http.delete' })}
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
            upstreamHeaderList: upstreamHeaderList.map((item) => {
              if (item.key === key) {
                return { ...(value as RouteModule.UpstreamHeader), key };
              }
              return item;
            }),
            key,
          });
        } else {
          onChange({
            upstreamHeaderList: upstreamHeaderList.concat({
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
            ? formatMessage({ id: 'route.http.edit.request.header' })
            : formatMessage({ id: 'route.http.operate.request.header' })
        }
        centered
        visible
        onOk={handleOk}
        onCancel={() => {
          setVisible(false);
          modalForm.resetFields();
        }}
        okText={formatMessage({ id: 'route.http.confirm' })}
        cancelText={formatMessage({ id: 'route.http.cancel' })}
        destroyOnClose
      >
        <Form form={modalForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label={formatMessage({ id: 'route.http.request.header.name' })}
            name="header_name"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'route.http.input.request.header.name' }),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'route.http.action' })}
            name="header_action"
            rules={[
              { required: true, message: formatMessage({ id: 'route.http.select.actions' }) },
            ]}
          >
            <Select onChange={(e) => setShowModalValue(e === 'override')}>
              <Select.Option value="override">
                {formatMessage({ id: 'route.http.override.or.create' })}
              </Select.Option>
              <Select.Option value="remove">
                {formatMessage({ id: 'route.http.delete' })}
              </Select.Option>
            </Select>
          </Form.Item>
          {showModalValue && (
            <Form.Item
              label={formatMessage({ id: 'route.http.value' })}
              name="header_value"
              rules={[{ required: true, message: formatMessage({ id: 'route.http.input.value' }) }]}
            >
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  };

  return (
    <PanelSection title={formatMessage({ id: 'route.http.override.request.header' })}>
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
          {formatMessage({ id: 'route.http.operation' })}
        </Button>
      )}
      <Table key="table" bordered dataSource={upstreamHeaderList} columns={columns} />
      {visible ? renderModal() : null}
    </PanelSection>
  );
};

export default HttpHeaderRewriteView;
