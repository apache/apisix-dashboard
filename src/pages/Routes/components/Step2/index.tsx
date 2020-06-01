import React from 'react';
import { Form, Row, Col, Input, Space, Button, Radio, InputNumber, Table } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import PanelSection from '../PanelSection';
import styles from '../../Create.less';

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const Step2: React.FC<RoutesModule.StepProps> = ({ data, onChange }) => {
  const { step2Data } = data;
  const { backendAddressList, backendProtocol } = step2Data;
  const [form] = Form.useForm();

  const renderRequestRewrite = () => {
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
        <Row key={`${item.host + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
          <Col span={12}>
            <Input placeholder="HOST" />
          </Col>
          <Col span={4}>
            <InputNumber placeholder="Port" />
          </Col>
          <Col span={4}>
            <InputNumber placeholder="Weights" />
          </Col>
          <Col span={4}>
            <Space>
              {backendAddressList.length > 1 && (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    onChange({
                      backendAddressList: backendAddressList.filter(
                        (_, _index) => _index !== index,
                      ),
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
        <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
          <Form.Item
            label="协议"
            name="protocol"
            rules={[{ required: true, message: '请勾选协议' }]}
          >
            <Row>
              <Radio.Group
                onChange={onProtocolChange}
                name="backendProtocol"
                value={backendProtocol}
              >
                <Radio value="HTTP">HTTP</Radio>
                <Radio value="HTTPS">HTTPS</Radio>
                <Radio value="originalRequest">原始请求</Radio>
              </Radio.Group>
            </Row>
          </Form.Item>
          <Form.Item label="后端地址" rules={[{ required: true, message: '请输入后端地址' }]}>
            {renderBackendAddress()}
            <Button
              type="primary"
              onClick={() => {
                addBackendAddress();
              }}
            >
              增加
            </Button>
          </Form.Item>
          <Form.Item label="后端请求 Path">
            <Row>
              <Input />
            </Row>
          </Form.Item>
          <Form.Item label="连接超时">
            <InputNumber /> ms
          </Form.Item>
          <Form.Item label="发送超时">
            <InputNumber /> ms
          </Form.Item>
          <Form.Item label="接收超时">
            <InputNumber /> ms
          </Form.Item>
        </Form>
      </PanelSection>
    );
  };

  const renderHttpHeaderRewrite = () => {
    return (
      <PanelSection title="HTTP 头改写">
        <div>
          <Button
            // TODO: Handle HttpHeaderRewrite table
            // onClick={handleAdd}
            type="primary"
            style={{
              marginBottom: 16,
            }}
          >
            新增
          </Button>
          <Table key="table" bordered />
        </div>
      </PanelSection>
    );
  };

  return (
    <>
      {renderRequestRewrite()}
      {renderHttpHeaderRewrite()}
    </>
  );
};

export default Step2;
