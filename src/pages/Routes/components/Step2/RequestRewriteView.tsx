import React from 'react';
import Form, { FormInstance } from 'antd/es/form';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import { Input, Row, Col, InputNumber, Button, Space } from 'antd';

import { FORM_ITEM_LAYOUT } from '@/pages/Routes/constants';
import PanelSection from '../PanelSection';
import styles from '../../Create.less';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const RequestRewriteView: React.FC<Props> = ({ data, form, disabled, onChange }) => {
  const { step2Data } = data;
  const { backendAddressList, backendProtocol } = step2Data;
  const onProtocolChange = (e: RadioChangeEvent) => {
    onChange({ backendProtocol: e.target.value });
  };

  const addBackendAddress = () => {
    onChange({
      backendAddressList: backendAddressList.concat({ host: '', port: 0, weight: 0 }),
    });
  };
  const renderBackendAddress = () =>
    backendAddressList.map((item, index) => (
      <Row key={`${item.host + index}`} style={{ marginBottom: '10px' }} gutter={16}>
        <Col span={9}>
          <Input placeholder="HOST" disabled={disabled} />
        </Col>
        <Col span={4}>
          <InputNumber placeholder="Port" disabled={disabled} />
        </Col>
        <Col span={4} offset={1}>
          <InputNumber placeholder="Weight" disabled={disabled} />
        </Col>
        <Col span={4} offset={1}>
          <Space>
            {backendAddressList.length > 1 && !disabled && (
              <Button
                type="primary"
                danger
                onClick={() => {
                  onChange({
                    backendAddressList: backendAddressList.filter((_, _index) => _index !== index),
                  });
                }}
              >
                删除
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    ));

  return (
    <PanelSection title="请求改写">
      <Form
        {...FORM_ITEM_LAYOUT}
        form={form}
        layout="horizontal"
        className={styles.stepForm}
        initialValues={step2Data}
      >
        <Form.Item label="协议" name="protocol" rules={[{ required: true, message: '请勾选协议' }]}>
          <Row>
            <Radio.Group
              onChange={onProtocolChange}
              name="backendProtocol"
              value={backendProtocol}
              disabled={disabled}
            >
              <Radio value="HTTP">HTTP</Radio>
              <Radio value="HTTPS">HTTPS</Radio>
              <Radio value="originalRequest">原始请求</Radio>
            </Radio.Group>
          </Row>
        </Form.Item>
        <Form.Item label="后端地址" rules={[{ required: true, message: '请输入后端地址' }]}>
          {renderBackendAddress()}
          {!disabled && (
            <Button type="primary" onClick={addBackendAddress}>
              增加
            </Button>
          )}
        </Form.Item>
        <Form.Item label="后端请求 Path">
          <Row>
            <Input disabled={disabled} />
          </Row>
        </Form.Item>
        <Form.Item label="连接超时">
          <InputNumber disabled={disabled} /> ms
        </Form.Item>
        <Form.Item label="发送超时">
          <InputNumber disabled={disabled} /> ms
        </Form.Item>
        <Form.Item label="接收超时">
          <InputNumber disabled={disabled} /> ms
        </Form.Item>
      </Form>
    </PanelSection>
  );
};

export default RequestRewriteView;
