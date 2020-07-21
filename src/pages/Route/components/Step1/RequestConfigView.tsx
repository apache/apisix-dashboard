import React from 'react';
import Form from 'antd/es/form';
import { Checkbox, Button, Input, Switch, Select, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { useIntl } from 'umi';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Route/constants';

import PanelSection from '@/components/PanelSection';

interface Props extends RouteModule.Data {}

const RequestConfigView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { step1Data } = data;
  const { protocols } = step1Data;
  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('http') && !e.includes('https')) return;
    onChange({ ...data.step1Data, protocols: e });
  };
  const { formatMessage } = useIntl();
  const renderHosts = () => (
    <Form.List name="hosts">
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? FORM_ITEM_LAYOUT : FORM_ITEM_WITHOUT_LABEL)}
                label={index === 0 ? formatMessage({ id: 'route.request.config.domain.name' }) : ''}
                required
                key={field.key}
                extra={index === 0 ? formatMessage({ id: 'route.request.config.domain.or.ip' }) : ''}
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: formatMessage({ id: 'route.request.config.input.domain.name' }),
                    },
                    {
                      pattern: new RegExp(/(^\*?[a-zA-Z0-9._-]+$|^\*$)/, 'g'),
                      message: formatMessage({ id: 'route.request.config.domain.name.rule' }),
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder={formatMessage({ id: 'route.request.config.input.domain.name' })} style={{ width: '60%' }} disabled={disabled} />
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
                  <PlusOutlined /> {formatMessage({ id: 'route.request.config.create' })}
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
                label={index === 0 ? formatMessage({ id: 'route.request.config.path' }) : ''}
                required
                key={field.key}
                extra={
                  index === 0 ? (
                    <div>
                      {formatMessage({ id: 'route.request.config.path.description1' })}
                      <br />
                      {formatMessage({ id: 'route.request.config.path.description2' })}
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
                      message: formatMessage({ id: 'route.request.config.input.path' }),
                    },
                    {
                      pattern: new RegExp(/^\/[a-zA-Z0-9\-._~%!$&'()+,;=:@/]*\*?$/, 'g'),
                      message: formatMessage({ id: 'route.request.config.path.rule' }),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    placeholder={formatMessage({ id: 'route.request.config.input.path' })}
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
                  <PlusOutlined /> {formatMessage({ id: 'route.request.config.create' })}
                </Button>
              </Form.Item>
            )}
          </div>
        );
      }}
    </Form.List>
  );

  return (
    <PanelSection title={formatMessage({ id: 'route.request.config.basic.define' })}>
      <Form.Item label={formatMessage({ id: 'route.request.config.protocol' })} name="protocols" rules={[{ required: true, message: formatMessage({ id: 'route.request.config.choose.protocol' }) }]}>
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
      {/* <Form.Item
        label="优先级"
        name="priority"
        rules={[{ required: true, message: '请输入优先级' }]}
        extra=""
      >
        <InputNumber placeholder="优先级" disabled={disabled} min={0} max={1000} />
      </Form.Item> */}
      {renderHosts()}
      {renderPaths()}
      <Form.Item
        label={formatMessage({ id: 'route.request.config.http.method' })}
        name="methods"
        rules={[{ required: true, message: formatMessage({ id: 'route.request.config.choose.http.method' }) }]}
      >
        <Checkbox.Group options={HTTP_METHOD_OPTION_LIST} disabled={disabled} />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'route.request.config.redirect' })} name="redirectOption">
        <Select disabled={disabled}>
          <Select.Option value="forceHttps">{formatMessage({ id: 'route.request.config.enable.https' })}</Select.Option>
          <Select.Option value="customRedirect">{formatMessage({ id: 'route.request.config.custom' })}</Select.Option>
          <Select.Option value="disabled">{formatMessage({ id: 'route.request.config.forbidden' })}</Select.Option>
        </Select>
      </Form.Item>
      {step1Data.redirectOption === 'customRedirect' && (
        <Form.Item label={formatMessage({ id: 'route.request.config.redirect.custom' })} required>
          <Row gutter={10}>
            <Col>
              <Form.Item name="redirectURI" rules={[{required: true}]}>
                <Input placeholder={formatMessage({ id: 'route.request.config.redirect.custom.example' })} disabled={disabled} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="redirectCode" rules={[{required: true}]}>
                <Select disabled={disabled}>
                  <Select.Option value={301}>{formatMessage({ id: 'route.request.config.redirect.301' })}</Select.Option>
                  <Select.Option value={302}>{formatMessage({ id: 'route.request.config.redirect.302' })}</Select.Option>
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
