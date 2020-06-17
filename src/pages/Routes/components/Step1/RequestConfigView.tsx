import React from 'react';
import Form from 'antd/es/form';
import { Checkbox, Button, Input, Switch, Select, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Routes/constants';

import PanelSection from '../PanelSection';

interface Props extends RouteModule.Data {}

const RequestConfigView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { step1Data } = data;
  const { protocols } = step1Data;
  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('http') && !e.includes('https')) return;
    onChange({ ...data.step1Data, protocols: e });
  };
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
                extra={index === 0 ? '域名或 IP：支持泛域名，如 "*.test.com"' : ''}
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
                  <PlusOutlined /> 新建
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
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 ? '路径' : ''}
                required
                key={field.key}
                extra={
                  index === 0 ? (
                    <div>
                      1. 请求路径，如 &quot;/foo/index.html&quot;，支持请求路径前缀
                      &quot;/foo/*&quot;；
                      <br />
                      2. &quot;/*&quot; 代表所有路径
                    </div>
                  ) : null
                }
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入请求路径',
                    },
                  ]}
                  noStyle
                >
                  <Input
                    placeholder="请输入请求路径"
                    style={{ width: '60%' }}
                    disabled={disabled}
                  />
                </Form.Item>
                {!disabled && fields.length > 1 && (
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
      {renderPaths()}
      <Form.Item
        label="HTTP 方法"
        name="methods"
        rules={[{ required: true, message: '请选择 HTTP 方法' }]}
      >
        <Checkbox.Group options={HTTP_METHOD_OPTION_LIST} disabled={disabled} />
      </Form.Item>
      <Form.Item label="重定向" name="redirectOption">
        <Select disabled={disabled}>
          <Select.Option value="forceHttps">启用 HTTPS</Select.Option>
          <Select.Option value="customRedirect">自定义</Select.Option>
          <Select.Option value="disabled">禁用</Select.Option>
        </Select>
      </Form.Item>
      {step1Data.redirectOption === 'customRedirect' && (
        <Form.Item label="自定义重定向">
          <Row gutter={10}>
            <Col>
              <Form.Item name="redirectURI">
                <Input placeholder="例如：/foo/index.html" disabled={disabled} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="redirectCode">
                <Select disabled={disabled}>
                  <Select.Option value="301">301（临时的重定向）</Select.Option>
                  <Select.Option value="302">302（永久的重定向）</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      )}
    </PanelSection>
  );
};

export default RequestConfigView;
