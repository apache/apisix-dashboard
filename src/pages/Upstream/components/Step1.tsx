import React from 'react';
import { Form, Input, Row, Col, InputNumber, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { FORM_ITEM_WITHOUT_LABEL, FORM_ITEM_LAYOUT } from '@/pages/Upstream/constants';

type Props = {
  form: FormInstance;
  disabled?: boolean;
};

const initialValues = {
  name: '',
  description: '',
  type: 'roundrobin',
  upstreamHostList: [{} as UpstreamModule.UpstreamHost],
  timeout: {
    connect: 6000,
    send: 6000,
    read: 6000,
  },
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
  const renderUpstreamMeta = () => (
    <Form.List name="upstreamHostList">
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item
              required
              key={field.key}
              {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
              label={index === 0 ? '后端服务域名/IP' : ''}
              extra={
                index === 0
                  ? '使用域名时，默认解析本地 /etc/resolv.conf；权重为0则熔断该节点。'
                  : ''
              }
            >
              <Row style={{ marginBottom: '10px' }} gutter={16}>
                <Col span={5}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'host']}
                    rules={[
                      { required: true, message: '请输入域名/IP' },
                      {
                        pattern: new RegExp(
                          /(^([1-9]?\d|1\d{2}|2[0-4]\d|25[0-5])(\.(25[0-5]|1\d{2}|2[0-4]\d|[1-9]?\d)){3}$|^(?![0-9.]+$)([a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+){0,}$)/,
                          'g',
                        ),
                        message: '仅支持数字或者字符 或者 . (.不是必须)',
                      },
                    ]}
                  >
                    <Input placeholder="域名/IP" disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'port']}
                    rules={[{ required: true, message: '请输入端口' }]}
                  >
                    <InputNumber placeholder="端口号" disabled={disabled} min={1} max={65535} />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'weight']}
                    rules={[{ required: true, message: '请输入权重' }]}
                  >
                    <InputNumber placeholder="权重" disabled={disabled} min={0} max={1000} />
                  </Form.Item>
                </Col>
                <Col
                  style={{
                    marginLeft: -10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {!disabled &&
                    (fields.length > 1 ? (
                      <MinusCircleOutlined
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    ) : null)}
                </Col>
              </Row>
            </Form.Item>
          ))}
          {!disabled && (
            <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                }}
              >
                <PlusOutlined /> 新建
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );

  const renderTimeUnit = () => <span style={{ margin: '0 8px' }}>ms</span>;

  return (
    <Form {...FORM_ITEM_LAYOUT} form={form} initialValues={initialValues}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]} extra="名称需全局唯一">
        <Input placeholder="请输入上游名称" disabled={disabled} />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <Input.TextArea placeholder="请输入描述" disabled={disabled} />
      </Form.Item>
      <Form.Item label="类型" name="type" rules={[{ required: true }]}>
        <Select disabled={disabled}>
          <Select.Option value="roundrobin">roundrobin</Select.Option>
          {/* TODO: chash */}
        </Select>
      </Form.Item>
      {renderUpstreamMeta()}
      <Form.Item label="连接超时" required>
        <Form.Item
          name={['timeout', 'connect']}
          noStyle
          rules={[{ required: true, message: '请输入连接超时时间' }]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
      <Form.Item label="发送超时" required>
        <Form.Item
          name={['timeout', 'send']}
          noStyle
          rules={[{ required: true, message: '请输入发送超时时间' }]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
      <Form.Item label="接收超时" required>
        <Form.Item
          name={['timeout', 'read']}
          noStyle
          rules={[{ required: true, message: '请输入接收超时时间' }]}
        >
          <InputNumber disabled={disabled} />
        </Form.Item>
        {renderTimeUnit()}
      </Form.Item>
    </Form>
  );
};

export default Step1;
