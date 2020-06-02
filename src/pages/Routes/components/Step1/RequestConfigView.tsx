import React, { useState } from 'react';
import Form from 'antd/es/form';
import { Row, Checkbox, Button, Col, Input, Space } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { HTTP_METHOD_OPTION_LIST } from '@/pages/Routes/constants';

import PanelSection from '../PanelSection';

interface Props extends RouteModule.Data {}

const RequestConfigView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { paths, hosts, protocols } = data.step1Data;
  const [httpMethodList, setHttpMethodList] = useState({
    checkedList: HTTP_METHOD_OPTION_LIST,
    indeterminate: false,
    checkAll: true,
  });

  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('HTTP') && !e.includes('HTTPS')) return;
    onChange({ ...data.step1Data, protocols: e });
  };
  const onMethodsChange = (checkedList: CheckboxValueType[]) => {
    setHttpMethodList({
      checkedList: checkedList as RouteModule.HttpMethod[],
      indeterminate: !!checkedList.length && checkedList.length < HTTP_METHOD_OPTION_LIST.length,
      checkAll: checkedList.length === HTTP_METHOD_OPTION_LIST.length,
    });
  };
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setHttpMethodList({
      checkedList: e.target.checked ? HTTP_METHOD_OPTION_LIST : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  };

  const renderHosts = () =>
    hosts.map((item, index) => (
      <Row key={`${item + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
        <Col span={16}>
          <Input placeholder="域名" disabled={disabled} />
        </Col>
        <Col span={4}>
          <Space>
            {hosts.length > 1 && !disabled && (
              <Button
                type="primary"
                danger
                onClick={() => {
                  onChange({
                    ...data.step1Data,
                    hosts: hosts.filter((_, _index) => _index !== index),
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

  const renderPaths = () =>
    paths.map((item, index) => (
      <Row key={`${item + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
        <Col span={16}>
          <Input placeholder="请输入请求路径" disabled={disabled} />
        </Col>
        {!disabled && (
          <Col span={4}>
            <Space>
              <Button
                type="primary"
                danger
                onClick={() => {
                  onChange({
                    ...data.step1Data,
                    paths: paths.filter((_, _index) => _index !== index),
                  });
                }}
              >
                删除
              </Button>
            </Space>
          </Col>
        )}
      </Row>
    ));

  return (
    <PanelSection title="请求基础定义">
      <Form.Item label="协议" name="protocol" rules={[{ required: true, message: '请勾选协议' }]}>
        <Row>
          <Checkbox.Group
            disabled={disabled}
            options={['HTTP', 'HTTPS', 'WebSocket']}
            defaultValue={protocols}
            value={protocols}
            onChange={onProtocolChange}
          />
        </Row>
      </Form.Item>
      {/* TODO: name */}
      <Form.Item label="域名" rules={[{ required: true, message: '请输入域名' }]}>
        {renderHosts()}
        {!disabled && (
          <Button
            type="primary"
            onClick={() => onChange({ ...data.step1Data, hosts: hosts.concat('') })}
          >
            增加
          </Button>
        )}
      </Form.Item>
      {/* TODO: name */}
      <Form.Item label="路径">
        {renderPaths()}
        {!disabled && (
          <Button
            onClick={() => onChange({ ...data.step1Data, paths: paths.concat(['']) })}
            type="primary"
          >
            增加
          </Button>
        )}
      </Form.Item>
      <Form.Item
        label="HTTP 方法"
        name="httpMethods"
        rules={[{ required: true, message: '请选择 HTTP 方法' }]}
      >
        <Checkbox
          indeterminate={httpMethodList.indeterminate}
          onChange={onCheckAllChange}
          checked={httpMethodList.checkAll}
          disabled={disabled}
        >
          ANY
        </Checkbox>
        <Checkbox.Group
          options={HTTP_METHOD_OPTION_LIST}
          value={httpMethodList.checkedList}
          onChange={onMethodsChange}
          disabled={disabled}
        />
      </Form.Item>
    </PanelSection>
  );
};

export default RequestConfigView;
