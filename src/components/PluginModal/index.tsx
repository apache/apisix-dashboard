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
        console.log(name, data);
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

    const { type, minLength, maxLength, minimum, maximum } = propertyValue;

    const requiredRule = schema.required?.includes(propertyName) ? [{ required: true }] : [];
    const typeRule = [{ type }];
    const enumRule = propertyValue.enum ? [{ type: 'enum', enum: propertyValue.enum }] : [];
    const rangeRule =
      type !== 'string' &&
      type !== 'array' &&
      (propertyValue.hasOwnProperty('minimum') || propertyValue.hasOwnProperty('maximum'))
        ? [
            {
              min: minimum ?? Number.MIN_SAFE_INTEGER,
              max: maximum ?? Number.MAX_SAFE_INTEGER,
            },
          ]
        : [];
    const lengthRule =
      type === 'string' || type === 'array'
        ? [{ min: minLength ?? Number.MIN_SAFE_INTEGER, max: maxLength ?? Number.MAX_SAFE_INTEGER }]
        : [];

    const rules = [...requiredRule, ...typeRule, ...enumRule, ...rangeRule, ...lengthRule];
    const flattend = rules.reduce((prev, next) => ({ ...prev, ...next }));
    return [flattend] as Rule[];
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
