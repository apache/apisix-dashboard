import React, { useState } from 'react';
import Form, { FormInstance } from 'antd/es/form';
import { Row, Checkbox, Button, Col, Input, Space } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import PanelSection from '../PanelSection';
import { formItemLayout } from '.';
import styles from '../../Create.less';
import { httpMethodOptionList } from '@/pages/Routes/constants';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const RequestConfigView: React.FC<Props> = ({ data, form, onChange }) => {
  const { paths, hosts } = data.step1Data;
  const [protocolValueList, setProtocolValueList] = useState<RouteModule.RequestProtocol[]>([
    'HTTP',
    'HTTPS',
  ]);
  const protocolList = ['HTTP', 'HTTPS', 'WebSocket'];
  const [httpMethodList, setHttpMethodList] = useState({
    checkedList: httpMethodOptionList,
    indeterminate: false,
    checkAll: true,
  });

  const onProtocolChange = (e: CheckboxValueType[]) => {
    if (!e.includes('HTTP') && !e.includes('HTTPS')) return;
    setProtocolValueList(e as RouteModule.RequestProtocol[]);
  };
  const onMethodsChange = (checkedList: CheckboxValueType[]) => {
    setHttpMethodList({
      checkedList: checkedList as RouteModule.HttpMethod[],
      indeterminate: !!checkedList.length && checkedList.length < httpMethodOptionList.length,
      checkAll: checkedList.length === httpMethodOptionList.length,
    });
  };
  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setHttpMethodList({
      checkedList: e.target.checked ? httpMethodOptionList : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  };

  const renderHosts = () =>
    hosts.map((item, index) => (
      <Row key={`${item + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
        <Col span={16}>
          <Input placeholder="HOST" />
        </Col>
        <Col span={4}>
          <Space>
            {hosts.length > 1 && (
              <Button
                type="primary"
                danger
                onClick={() => {
                  onChange({ hosts: hosts.filter((_, _index) => _index !== index) });
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
          <Input placeholder="请输入 Path" />
        </Col>
        <Col span={4}>
          <Space>
            <Button
              type="primary"
              danger
              onClick={() => {
                onChange({ paths: paths.filter((_, _index) => _index !== index) });
              }}
            >
              删除
            </Button>
          </Space>
        </Col>
      </Row>
    ));

  const addPath = () => {
    onChange({
      paths: paths.concat(['']),
    });
  };

  return (
    <PanelSection title="请求基础定义">
      <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
        <Form.Item label="协议" name="protocol" rules={[{ required: true, message: '请勾选协议' }]}>
          <Row>
            <Checkbox.Group
              options={protocolList}
              value={protocolValueList}
              onChange={onProtocolChange}
            />
          </Row>
        </Form.Item>
        {/* TODO: name */}
        <Form.Item label="HOST" rules={[{ required: true, message: '请输入 HOST' }]}>
          {renderHosts()}
          <Button type="primary" onClick={() => onChange({ hosts: hosts.concat('') })}>
            增加
          </Button>
        </Form.Item>
        {/* TODO: name */}
        <Form.Item label="PATH">
          {renderPaths()}
          <Button onClick={addPath} type="primary">
            增加
          </Button>
        </Form.Item>
        <Form.Item
          label="HTTP Methods"
          name="httpMethods"
          rules={[{ required: true, message: '请勾选 HTTP Methods' }]}
        >
          <Checkbox
            indeterminate={httpMethodList.indeterminate}
            onChange={onCheckAllChange}
            checked={httpMethodList.checkAll}
          >
            ANY
          </Checkbox>
          <Checkbox.Group
            options={httpMethodOptionList}
            value={httpMethodList.checkedList}
            onChange={onMethodsChange}
          />
        </Form.Item>
      </Form>
    </PanelSection>
  );
};

export default RequestConfigView;
