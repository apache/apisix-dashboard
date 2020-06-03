import React from 'react';
import Form, { FormInstance } from 'antd/es/form';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import { Input, Row, Col, InputNumber, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { FORM_ITEM_LAYOUT, FORM_ITEM_WITHOUT_LABEL } from '@/pages/Routes/constants';
import PanelSection from '../PanelSection';
import styles from '../../Create.less';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const RequestRewriteView: React.FC<Props> = ({ data, form, disabled, onChange }) => {
  const { step2Data } = data;
  const onProtocolChange = (e: RadioChangeEvent) => {
    onChange({ upstreamProtocol: e.target.value });
  };

  const renderUpstreamMeta = () => (
    <Form.List name="upstreamHostList">
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item
              required
              key={field.key}
              {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
              label={index === 0 ? '域名/IP' : ''}
            >
              <Row style={{ marginBottom: '10px' }} gutter={16}>
                <Col span={9}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'host']}
                    rules={[{ required: true, message: '请输入域名/IP' }]}
                  >
                    <Input placeholder="域名/IP" disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'port']}
                    rules={[{ required: true, message: '请输入端口' }]}
                  >
                    <InputNumber placeholder="端口号" disabled={disabled} min={1} max={65535} />
                  </Form.Item>
                </Col>
                <Col span={4} offset={1}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name={[field.name, 'weight']}
                    rules={[{ required: true, message: '请输入权重' }]}
                  >
                    <InputNumber placeholder="权重" disabled={disabled} min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col>
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
                <PlusOutlined /> 增加
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );

  const renderTimeUnit = () => <span style={{ margin: '0 8px' }}>ms</span>;

  return (
    <PanelSection title="请求改写">
      <Form
        {...FORM_ITEM_LAYOUT}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        initialValues={step2Data}
      >
        <Form.Item
          label="协议"
          name="upstreamProtocol"
          rules={[{ required: true, message: '请勾选协议' }]}
        >
          <Radio.Group onChange={onProtocolChange} name="upstreamProtocol" disabled={disabled}>
            <Radio value="original">原始请求</Radio>
            <Radio value="http">HTTP</Radio>
            <Radio value="https">HTTPS</Radio>
          </Radio.Group>
        </Form.Item>
        {renderUpstreamMeta()}
        <Form.Item
          label="请求路径"
          name="upstreamPath"
          rules={[{ required: true, message: '请输入请求路径' }]}
        >
          <Input disabled={disabled} />
        </Form.Item>
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
    </PanelSection>
  );
};

export default RequestRewriteView;
