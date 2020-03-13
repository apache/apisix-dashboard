import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, InputNumber } from 'antd';
import { useForm } from 'antd/es/form/util';
import { Rule } from 'antd/es/form';

import { fetchPluginSchema } from '@/services/plugin';

interface Props {
  visible: boolean;
  name: string;
  initialData?: PluginSchema;
  onFinish(values: any): void;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 12 },
};

const renderComponentByProperty = (property: PluginProperty) => {
  if (property.type === 'string') {
    if (property.enum) {
      return (
        <Select>
          {property.enum.map(enumValue => (
            <Select.Option value={enumValue} key={enumValue}>
              {enumValue}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input />;
  }

  if (property.type === 'boolean') {
    return <Switch />;
  }

  if (property.type === 'number' || property.type === 'integer') {
    return (
      <InputNumber
        min={property.minimum ?? Number.MIN_SAFE_INTEGER}
        max={property.maximum ?? Number.MAX_SAFE_INTEGER}
      />
    );
  }

  return <Input />;
};

const PluginModal: React.FC<Props> = ({ name, visible, initialData = {}, onFinish }) => {
  const [schema, setSchema] = useState<PluginSchema>();
  const [form] = useForm();

  useEffect(() => {
    if (name) {
      fetchPluginSchema(name).then(data => {
        setSchema(data);

        requestAnimationFrame(() => {
          form.setFieldsValue(initialData);
        });
      });
    }
  }, [name]);

  const calculateRules = (propertyName: string, propertyValue: PluginProperty): Rule[] => {
    if (!schema) {
      return [];
    }

    // TODO: i18n
    const requiredRule = schema.required?.includes(propertyName)
      ? [{ required: true, message: '必填' }]
      : [];
    const typeRule = [{ type: propertyValue.type }];
    const enumRule = propertyValue.enum ? [{ type: 'enum', enum: propertyValue.enum }] : [];
    const rangeRule =
      propertyValue.hasOwnProperty('minimum') || propertyValue.hasOwnProperty('maximum')
        ? [
            {
              min: propertyValue.minimum ?? Number.MIN_SAFE_INTEGER,
              max: propertyValue.maximum ?? Number.MAX_SAFE_INTEGER,
            },
          ]
        : [];

    return [...requiredRule, ...typeRule, ...enumRule, ...rangeRule] as Rule[];
  };

  return (
    <Modal destroyOnClose visible={visible}>
      <Form {...formLayout} form={form} onFinish={onFinish}>
        {Object.entries(schema?.properties || {}).map(([propertyName, propertyValue]) => (
          <Form.Item
            label={propertyName}
            name={propertyName}
            key={propertyName}
            rules={calculateRules(propertyName, propertyValue)}
          >
            {renderComponentByProperty(propertyValue)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default PluginModal;
