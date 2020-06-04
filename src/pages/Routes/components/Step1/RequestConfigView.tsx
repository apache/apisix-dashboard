import React from 'react';
import Form from 'antd/es/form';
import { Checkbox, Button, Input, Switch, Select, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Routes/constants';

import PanelSection from '../PanelSection';

interface Props extends RouteModule.Data {}

const { Option } = Select;

const RequestConfigView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { protocols } = data.step1Data;

  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('http') && !e.includes('https')) return;
    onChange({ ...data.step1Data, protocols: e });
  };

const RequestConfigView: React.FC<Props> = ({ data, disabled }) => {
  const { step1Data } = data;
  const renderHosts = () => (
    <Form.List name="hosts">
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 ? '域名' : ''}
                required
                key={field.key}
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入域名',
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder="请输入域名" style={{ width: '60%' }} disabled={disabled} />
                </Form.Item>
                {!disabled && fields.length > 1 ? (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    style={{ margin: '0 8px' }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                ) : null}
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
          </div>
        );
      }}
    </Form.List>
  );

  const renderPaths = () => (
    <Form.List name="paths">
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field) => (
              <Form.Item required key={field.key}>
                <Form.Item {...field} validateTrigger={['onChange', 'onBlur']} noStyle>
                  <Input placeholder="请输入路径" style={{ width: '60%' }} disabled={disabled} />
                </Form.Item>
                {!disabled && (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    style={{ margin: '0 8px' }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                )}
              </Form.Item>
            ))}
            {fields.length === 0 && disabled && <span>无</span>}
            {!disabled && (
              <Form.Item>
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
          </div>
        );
      }}
    </Form.List>
  );

  return (
    <PanelSection title="请求基础定义">
      <Form.Item label="协议" name="protocols" rules={[{ required: true, message: '请选择协议' }]}>
        <Checkbox.Group
          disabled={disabled}
          options={['http', 'https']}
          value={protocols}
          onChange={onProtocolChange}
        />
      </Form.Item>
      <Form.Item label="WebSocket" name="websocket" valuePropName="checked">
        <Switch disabled={disabled} />
      </Form.Item>
      {renderHosts()}
      <Form.Item label="路径">{renderPaths()}</Form.Item>
      <Form.Item
        label="HTTP 方法"
        name="methods"
        rules={[{ required: true, message: '请选择 HTTP 方法' }]}
      >
        <Checkbox.Group options={HTTP_METHOD_OPTION_LIST} disabled={disabled} />
      </Form.Item>
      <Form.Item label="redirect" name="redirect" valuePropName="checked">
        <Switch disabled={disabled} />
      </Form.Item>
      {step1Data.redirect && (
        <>
          <Form.Item label="强制 HTTPS" valuePropName="checked" name="forceHttps">
            <Switch disabled={disabled || step1Data.protocols.includes('HTTPS')} />
          </Form.Item>
          {!step1Data.forceHttps && (
            <Form.Item label="自定义参数" required>
              <Row gutter={10}>
                <Col>
                  <Form.Item
                    name="redirectURI"
                    rules={[{ required: true, message: '请输入 URI' }]}
                  >
                    <Input placeholder="请输入 URI" disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="redirectCode" rules={[{ required: true, message: '请选择状态码' }]}>
                    <Select disabled={disabled}>
                      <Option value="301">301</Option>
                      <Option value="302">302</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
        </>
      )}
    </PanelSection>
  );
};

export default RequestConfigView;
