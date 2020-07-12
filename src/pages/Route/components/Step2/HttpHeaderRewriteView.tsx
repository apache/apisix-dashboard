import React, { useState } from 'react';
import Form from 'antd/es/form';
import { Button, Table, Space, Modal, Input, Select } from 'antd';

import PanelSection from '@/components/PanelSection';

interface Props extends RouteModule.Data {}

const HttpHeaderRewriteView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { upstreamHeaderList = [] } = data.step2Data;
  const [visible, setVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [mode, setMode] = useState<RouteModule.ModalType>('CREATE');
  const [showModalValue, setShowModalValue] = useState(true);

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
      title: '请求头',
      dataIndex: 'header_name',
      key: 'header_name',
    },
    {
      title: '行为',
      dataIndex: 'header_action',
      key: 'header_action',
      render: (action: 'override' | 'remove') => {
        return action === 'override' ? '重写/添加' : '删除';
      },
    },
    {
      title: '值',
      dataIndex: 'header_value',
      key: 'header_value',
    },
    disabled
      ? {}
      : {
          title: '操作',
          key: 'action',
          render: (_: any, record: RouteModule.UpstreamHeader) => (
            <Space size="middle">
              <a
                onClick={() => {
                  handleEdit(record);
                }}
              >
                编辑
              </a>
              <a
                onClick={() => {
                  handleRemove(record.key);
                }}
              >
                删除
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
        title={mode === 'EDIT' ? '编辑请求头' : '操作请求头'}
        centered
        visible
        onOk={handleOk}
        onCancel={() => {
          setVisible(false);
          modalForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={modalForm} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Form.Item
            label="请求头"
            name="header_name"
            rules={[{ required: true, message: '请输入请求头' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="行为"
            name="header_action"
            rules={[{ required: true, message: '请输入请求头' }]}
          >
            <Select onChange={(e) => setShowModalValue(e === 'override')}>
              <Select.Option value="override">重写/添加</Select.Option>
              <Select.Option value="remove">删除</Select.Option>
            </Select>
          </Form.Item>
          {showModalValue && (
            <Form.Item
              label="值"
              name="header_value"
              rules={[{ required: true, message: '请输入值' }]}
            >
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  };

  return (
    <PanelSection title="HTTP 头改写">
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
          操作
        </Button>
      )}
      <Table key="table" bordered dataSource={upstreamHeaderList} columns={columns} />
      {visible ? renderModal() : null}
    </PanelSection>
  );
};

export default HttpHeaderRewriteView;
