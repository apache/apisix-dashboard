import React, { useState } from 'react';
import { Button, Table, Modal, Form, Select, Input, Space } from 'antd';

import PanelSection from '@/components/PanelSection';

interface Props extends RouteModule.Data {}

const MatchingRulesView: React.FC<Props> = ({ data, disabled, onChange }) => {
  const { advancedMatchingRules } = data.step1Data;

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<RouteModule.ModalType>('CREATE');
  const [namePlaceholder, setNamePlaceholder] = useState('');
  const [modalForm] = Form.useForm();

  const { Option } = Select;

  const onOk = () => {
    modalForm.validateFields().then((value) => {
      if (mode === 'EDIT') {
        const key = modalForm.getFieldValue('key');
        onChange({
          ...data.step1Data,
          advancedMatchingRules: advancedMatchingRules.map((rule) => {
            if (rule.key === key) {
              return { ...(value as RouteModule.MatchingRule), key };
            }
            return rule;
          }),
        });
      } else {
        const rule = {
          ...(value as RouteModule.MatchingRule),
          key: Math.random().toString(36).slice(2),
        };
        onChange({ ...data.step1Data, advancedMatchingRules: advancedMatchingRules.concat(rule) });
      }
      modalForm.resetFields();
      setVisible(false);
    });
  };

  const handleEdit = (record: RouteModule.MatchingRule) => {
    setMode('EDIT');
    setVisible(true);
    modalForm.setFieldsValue(record);
  };

  const handleRemove = (key: string) => {
    onChange({
      ...data.step1Data,
      advancedMatchingRules: advancedMatchingRules.filter((item) => item.key !== key),
    });
  };

  const columns = [
    {
      title: '参数位置',
      key: 'position',
      render: (text: RouteModule.MatchingRule) => {
        let renderText;
        switch (text.position) {
          case 'http':
            renderText = 'HTTP 请求头';
            break;
          case 'arg':
            renderText = '请求参数';
            break;
          case 'cookie':
            renderText = 'Cookie';
            break;
          default:
            renderText = '';
        }
        return renderText;
      },
    },
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '运算符',
      key: 'operator',
      render: (text: RouteModule.MatchingRule) => {
        let renderText;
        switch (text.operator) {
          case '==':
            renderText = '等于';
            break;
          case '～=':
            renderText = '不等于';
            break;
          case '>':
            renderText = '大于';
            break;
          case '<':
            renderText = '小于';
            break;
          case '~~':
            renderText = '正则匹配';
            break;
          default:
            renderText = '';
        }
        return renderText;
      },
    },
    {
      title: '参数值',
      dataIndex: 'value',
      key: 'value',
    },
    disabled
      ? {}
      : {
          title: '操作',
          key: 'action',
          render: (_: any, record: RouteModule.MatchingRule) => (
            <Space size="middle">
              <a onClick={() => handleEdit(record)}>编辑</a>
              <a onClick={() => handleRemove(record.key)}>删除</a>
            </Space>
          ),
        },
  ];

  const renderModal = () => (
    <Modal
      title={mode === 'EDIT' ? '编辑规则' : '新建规则'}
      centered
      visible
      onOk={onOk}
      onCancel={() => {
        setVisible(false);
        modalForm.resetFields();
      }}
      okText="确定"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={modalForm} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item
          label="参数位置"
          name="position"
          rules={[{ required: true, message: '请选择参数位置' }]}
        >
          <Select
            onChange={(value) => {
              if (value === 'http') {
                setNamePlaceholder('请求头键名：例如 HOST');
              } else {
                setNamePlaceholder('参数名称：例如 id');
              }
            }}
          >
            <Option value="http">HTTP 请求头</Option>
            <Option value="arg">请求参数</Option>
            <Option value="cookie">Cookie</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="参数名称"
          name="name"
          rules={[
            { required: true, message: '请输入参数名称' },
            {
              pattern: new RegExp(/^([a-zA-Z][a-zA-Z0-9_-]*$)/, 'g'),
              message: '参数只支持字母、数字、-、_，并且以字母开头',
            },
          ]}
          extra="只支持字母和数字，并且以字母开头"
        >
          <Input placeholder={namePlaceholder} />
        </Form.Item>
        <Form.Item
          label="运算符"
          name="operator"
          rules={[{ required: true, message: '请选择运算符' }]}
        >
          <Select>
            <Option value="==">等于</Option>
            <Option value="～=">不等于</Option>
            <Option value=">">大于</Option>
            <Option value="<">小于</Option>
            <Option value="~~">正则匹配</Option>
          </Select>
        </Form.Item>
        <Form.Item label="值" name="value" rules={[{ required: true, message: '请输入参数值' }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <PanelSection title="高级路由匹配条件">
      {!disabled && (
        <Button
          onClick={() => {
            setMode('CREATE');
            setVisible(true);
          }}
          type="primary"
          style={{
            marginBottom: 16,
          }}
        >
          新建
        </Button>
      )}
      <Table key="table" bordered dataSource={advancedMatchingRules} columns={columns} />
      {/* NOTE: tricky way, switch visible on Modal component will ocure error */}
      {visible ? renderModal() : null}
    </PanelSection>
  );
};

export default MatchingRulesView;
