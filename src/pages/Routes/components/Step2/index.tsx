import React, { useState } from 'react';
import { Form, Row, Col, Input, Space, Button, Radio, InputNumber, Table, Modal } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import PanelSection from '../PanelSection';
import styles from '../../Create.less';

const { TextArea } = Input;

const initEditModalData: RoutesModule.UpstreamHeader = {
  header_name: '',
  header_value: '',
  header_desc: '',
  key: '',
};

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
  const { upstream_header } = step2Data;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [editModalData, setEditModalData] = useState<RoutesModule.UpstreamHeader>(
    initEditModalData,
  );
  const { backendAddressList, backendProtocol } = step2Data;
  const [form] = Form.useForm();

  const handleRemove = (key: string) => {
    onChange({ upstream_header: upstream_header.filter((item) => item.key !== key) });
  };

  const columns = [
    {
      title: '请求头',
      dataIndex: 'header_name',
      key: 'header_name',
    },
    {
      title: '值',
      dataIndex: 'header_value',
      key: 'header_value',
    },
    {
      title: '描述',
      dataIndex: 'header_desc',
      key: 'header_desc',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: RoutesModule.UpstreamHeader) => (
        <Space size="middle">
          <a
            onClick={() => {
              handleRemove(record.key);
            }}
          >
            移除
          </a>
        </Space>
      ),
    },
  ];

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
        <Form
          {...formItemLayout}
          form={form}
          layout="horizontal"
          className={styles.stepForm}
          initialValues={step2Data}
        >
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
    const handleAdd = () => {
      setModalVisible(true);
    };
    return (
      <PanelSection title="HTTP 头改写">
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
          <Table key="table" bordered dataSource={upstream_header} columns={columns} />
        </div>
      </PanelSection>
    );
  };

  const renderModal = () => {
    const handleOk = () => {
      modalForm.validateFields().then((value) => {
        onChange({
          upstream_header: upstream_header.concat({
            ...(value as RoutesModule.UpstreamHeader),
            key: Math.random().toString(36).slice(2),
          }),
        });
        setModalVisible(false);
      });
    };
    const handleCancel = () => {
      setModalVisible(false);
    };

    const handleClose = () => {
      setEditModalData(initEditModalData);
      modalForm.resetFields();
    };

    return (
      <Modal
        title="新增"
        centered
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        afterClose={handleClose}
        destroyOnClose
      >
        <Form
          form={modalForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          initialValues={editModalData}
        >
          <Form.Item
            label="请求头"
            name="header_name"
            rules={[{ required: true, message: '请输入请求头' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="值" name="header_value" rules={[{ required: true, message: '值' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="upstream_header_desc">
            <TextArea />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <>
      {renderModal()}
      {renderRequestRewrite()}
      {renderHttpHeaderRewrite()}
    </>
  );
};

export default Step2;
