import React, { useState } from 'react';
import {
  Form,
  Button,
  Divider,
  Input,
  Checkbox,
  Row,
  Col,
  Table,
  Space,
  Modal,
  Select,
} from 'antd';
import styles from '../../Create.less';

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

const Step1: React.FC<RoutesModule.StepProps> = ({ pageData, onChange }) => {
  const { step1PageData } = pageData;
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalData, setEditModalData] = useState();

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleEdit = (text: any, record: any) => {
    setEditModalData(record);
  };

  const handleDelete = (text: any, record: any) => {
    const { advancedConfig } = step1PageData;
    const filteredAdvancedConfig = advancedConfig.filter((item) => item.key !== record.key);
    onChange({ advancedConfig: filteredAdvancedConfig });
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
      render: (text: any, record: any) => (
        <Space size="middle">
          <a onClick={() => handleEdit(text, record)}>编辑</a>
          <a onClick={() => handleDelete(text, record)}>移除</a>
        </Space>
      ),
    },
  ];

  const addHost = () => {
    const { hosts } = step1PageData;
    onChange({
      hosts: hosts.concat([
        {
          host: '',
          port: '',
          priority: '',
        },
      ]),
    });
  };

  const renderHosts = () =>
    step1PageData.hosts?.map((item, index) => (
      <Row
        key={Math.random().toString(36).slice(2)}
        style={{ marginBottom: '10px' }}
        gutter={[16, 16]}
      >
        <Col span={8}>
          <Input placeholder="IP/HOST" />
        </Col>
        <Col span={4}>
          <Input placeholder="PORT" />
        </Col>
        <Col span={4}>
          <Input />
        </Col>
        <Col span={4}>
          <Space>
            <Button
              type="primary"
              danger
              onClick={() => {
                const { hosts } = step1PageData;
                hosts.splice(index, 1);
                onChange({ hosts });
              }}
            >
              删除
            </Button>
          </Space>
        </Col>
      </Row>
    ));

  const renderNameAndDesc = () => (
    <>
      <div>名称及其描述</div>
      <Divider />
      <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
        <Form.Item
          label="API名称"
          name="APIName"
          rules={[{ required: true, message: '请输入API名称' }]}
        >
          <Input placeholder="请输入API名称" />
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <TextArea placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </>
  );

  const renderBaseRequestConfig = () => (
    <>
      <div>请求基础定义</div>
      <Divider />
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
        <Form.Item label="IP/HOST" rules={[{ required: true, message: '请输入HOST' }]}>
          {renderHosts()}
          <Button onClick={addHost} type="primary">
            增加
          </Button>
        </Form.Item>
        <Form.Item label="请求PATH" name="path" rules={[{ required: true, message: '请输入PATH' }]}>
          <Input placeholder="请输入PATH" />
        </Form.Item>
        <Form.Item
          label="HTTP Methods"
          name="httpMethods"
          rules={[{ required: true, message: '请勾选HTTP Methods' }]}
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

  const renderModal = () => {
    const [modalForm] = Form.useForm();
    const validateModalFields = modalForm.validateFields;
    const { resetFields } = modalForm;
    const handleOk = () => {
      validateModalFields().then((value) => {
        const { advancedConfig } = step1PageData;
        onChange({
          advancedConfig: advancedConfig.concat({
            ...(value as RoutesModule.Step1ModalProps),
            key: Math.random().toString(36).slice(2),
          }),
        });
      });
    };

    const handleCancel = () => {
      setModalVisible(false);
    };

    const handleAfterClose = () => {
      resetFields();
    };
    return (
      <>
        <Modal
          title="新增"
          centered
          visible={modalVisible}
          afterClose={handleAfterClose}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose
        >
          <Form
            name="basic"
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
                <Option value=">">大于</Option>
                <Option value="<">小于</Option>
                <Option value="=">等于</Option>
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
      </>
    );
  };

  const renderAdvancedConfig = () => (
    <>
      <div>高级路由匹配条件</div>
      <Divider />
      <div key="div">
        <Button
          onClick={handleAdd}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          新增
        </Button>
        <Table key="table" bordered dataSource={step1PageData.advancedConfig} columns={columns} />
      </div>
    </>
  );

  return (
    <>
      {renderModal()}
      {renderNameAndDesc()}
      {renderBaseRequestConfig()}
      {renderAdvancedConfig()}
    </>
  );
};

export default Step1;
