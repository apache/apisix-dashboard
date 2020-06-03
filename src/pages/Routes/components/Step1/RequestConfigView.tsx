import React, { useState } from 'react';
import Form from 'antd/es/form';
import { Checkbox, Button, Input, Switch } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

import {
  HTTP_METHOD_OPTION_LIST,
  FORM_ITEM_LAYOUT,
  FORM_ITEM_WITHOUT_LABEL,
} from '@/pages/Routes/constants';

import PanelSection from '../PanelSection';

interface Props extends RouteModule.Data {}

const RequestConfigView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { protocols } = data.step1Data;

  // TODO: checkedList Validation
  const [checkedList, setCheckedList] = useState(HTTP_METHOD_OPTION_LIST);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('HTTP') && !e.includes('HTTPS')) return;
    onChange({ ...data.step1Data, protocols: e });
  };

  const onMethodsChange = (methods: CheckboxValueType[]) => {
    setCheckedList(methods as RouteModule.HttpMethod[]);
    setIndeterminate(!!methods.length && methods.length < HTTP_METHOD_OPTION_LIST.length);
    setCheckAll(methods.length === HTTP_METHOD_OPTION_LIST.length);
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setCheckedList(e.target.checked ? HTTP_METHOD_OPTION_LIST : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
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
            <Form.Item {...FORM_ITEM_WITHOUT_LABEL}>
              {!disabled && (
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> 增加
                </Button>
              )}
            </Form.Item>
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
            <Form.Item>
              {!disabled && (
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> 增加
                </Button>
              )}
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  );

  return (
    <PanelSection title="请求基础定义">
      <Form.Item label="协议" name="protocols" rules={[{ required: true, message: '请勾选协议' }]}>
        <Checkbox.Group
          disabled={disabled}
          options={['HTTP', 'HTTPS']}
          value={protocols}
          onChange={onProtocolChange}
        />
      </Form.Item>
      <Form.Item label="WebSocket" name="WebSocket" valuePropName="checked">
        <Switch />
      </Form.Item>
      {renderHosts()}
      <Form.Item label="路径">{renderPaths()}</Form.Item>
      <Form.Item label="HTTP 方法" name="httpMethods">
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
          disabled={disabled}
        >
          ANY
        </Checkbox>
        <Checkbox.Group
          options={HTTP_METHOD_OPTION_LIST}
          value={checkedList}
          onChange={onMethodsChange}
          disabled={disabled}
        />
      </Form.Item>
    </PanelSection>
  );
};

export default RequestConfigView;
