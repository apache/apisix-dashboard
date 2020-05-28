import React, { useState } from 'react';
import { Form, Button, Input, Checkbox, Row, Col, Table, Space, Modal, Select } from 'antd';
import styles from '../../Create.less';

import PanelSection from '../PanelSection';

const { TextArea } = Input;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const Step1: React.FC<RoutesModule.StepProps> = ({ data, onChange }) => {
  const { step1Data } = data;
  const { hosts, path } = step1Data;
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalData, setEditModalData] = useState();

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditModalData(record);
    requestAnimationFrame(() => {
      setModalVisible(true);
    });
  };

  const handleDelete = (record: any) => {
    const { advancedMatchingRules } = step1Data;
    const filteredAdvancedMatchingRules = advancedMatchingRules.filter(
      (item) => item.key !== record.key,
    );
    onChange({ advancedMatchingRules: filteredAdvancedMatchingRules });
  };

  const columns = [
    {
      title: '参数位置',
      dataIndex: 'paramsLocation',
      key: 'paramsLocation',
    },
    {
      title: '参数名称',
      dataIndex: 'paramsName',
      key: 'paramsName',
    },
    {
      title: '表达式',
      dataIndex: 'paramsExpresstion',
      key: 'paramsExpresstion',
    },
    {
      title: '参数值',
      dataIndex: 'paramsValue',
      key: 'paramsValue',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>移除</a>
        </Space>
      ),
    },
  ];

  const addHost = () => {
    onChange({
      hosts: hosts.concat([
        {
          host: '',
          port: 0,
          priority: 0,
        },
      ]),
    });
  };

  const renderHosts = () =>
    step1Data.hosts.map((item, index) => (
      <Row key={`${item.host + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
        <Col span={8}>
          <Input placeholder="IP/HOST" />
        </Col>
        <Col span={4}>
          <Input placeholder="PORT" />
        </Col>
        <Col span={4}>
          <Input placeholder="PRIORITY" />
        </Col>
        <Col span={4}>
          <Space>
            <Button
              type="primary"
              danger
              onClick={() => {
                const newHosts = hosts.filter((_, _index) => _index !== index);
                onChange({ hosts: newHosts });
              }}
            >
              删除
            </Button>
          </Space>
        </Col>
      </Row>
    ));

  const renderPaths = () =>
    step1Data.path.map((item, index) => (
      <Row key={`${item + index}`} style={{ marginBottom: '10px' }} gutter={[16, 16]}>
        <Col span={16}>
          <Input placeholder="请输入 PATH" />
        </Col>
        <Col span={4}>
          <Space>
            <Button
              type="primary"
              danger
              onClick={() => {
                const newpath = path.filter((_, _index) => _index !== index);
                onChange({ path: newpath });
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
      path: path.concat(['']),
    });
  };

  const renderMeta = () => (
    <>
      <PanelSection title="名称及其描述" />
      <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
        <Form.Item
          label="API 名称"
          name="name"
          rules={[{ required: true, message: '请输入 API 名称' }]}
        >
          <Input placeholder="请输入 API 名称" />
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <TextArea placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </>
  );

  const renderBaseRequestConfig = () => (
    <>
      <PanelSection title="请求基础定义" />
      <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
        <Form.Item label="协议" name="protocol" rules={[{ required: true, message: '请勾选协议' }]}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {['HTTP', 'HTTPS', 'WebSocket'].map((item) => (
                <Col span={6} key={item}>
                  <Checkbox value={item}>{item}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="IP/HOST" rules={[{ required: true, message: '请输入 HOST' }]}>
          {renderHosts()}
          <Button onClick={addHost} type="primary">
            增加
          </Button>
        </Form.Item>
        <Form.Item label="PATH" name="path" rules={[{ required: true, message: '请输入 PATH' }]}>
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
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {['ANY', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'].map((item) => (
                <Col span={6} key={item}>
                  <Checkbox value={item}>{item}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </>
  );

  const [modalForm] = Form.useForm();
  const validateModalFields = modalForm.validateFields;
  const handleOk = () => {
    validateModalFields().then((value) => {
      const { advancedMatchingRules } = step1Data;
      onChange({
        advancedMatchingRules: advancedMatchingRules.concat({
          ...(value as RoutesModule.Step1ModalProps),
          key: Math.random().toString(36).slice(2),
        }),
      });
      setModalVisible(false);
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const renderadvancedMatchingRules = () => (
    <>
      <PanelSection title="高级路由匹配条件" />
      <div>
        <Button
          onClick={handleAdd}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          新增
        </Button>
        <Table
          key="table"
          bordered
          dataSource={step1Data.advancedMatchingRules}
          columns={columns}
        />
      </div>
    </>
  );

  return (
    <>
      {modalVisible && (
        <Modal title="新增" centered visible onOk={handleOk} onCancel={handleCancel} destroyOnClose>
          <Form
            form={modalForm}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            initialValues={editModalData}
          >
            <Form.Item
              label="参数位置"
              name="paramsLocation"
              rules={[{ required: true, message: '请选择参数位置' }]}
            >
              <Select>
                <Option value="header">header</Option>
                <Option value="query">query</Option>
                <Option value="params">params</Option>
                <Option value="cookie">cookie</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="参数名称"
              name="paramsName"
              rules={[{ required: true, message: '请输入参数名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="表达式"
              name="paramsExpresstion"
              rules={[{ required: true, message: '请选择表达式' }]}
            >
              <Select>
                <Option value="==">等于</Option>
                <Option value="～=">不等于</Option>
                <Option value=">">大于</Option>
                <Option value="<">小于</Option>
                <Option value="~~">正则匹配</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="参数值"
              name="paramsValue"
              rules={[{ required: true, message: '请输入参数值' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="备注" name="remark">
              <TextArea placeholder="请输入备注" />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {renderMeta()}
      {renderBaseRequestConfig()}
      {renderadvancedMatchingRules()}
    </>
  );
};

export default Step1;
