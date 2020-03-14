import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, InputNumber, Button } from 'antd';
import { useForm } from 'antd/es/form/util';
import { Rule } from 'antd/es/form';

import { fetchPluginSchema } from '@/services/plugin';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface Props {
  visible: boolean;
  name: string;
  initialData?: PluginSchema;
  onFinish(values: any): void;
}

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const renderComponentByProperty = (propertyValue: PluginProperty) => {
  const { type, minimum, maximum } = propertyValue;

  if (type === 'string') {
    if (propertyValue.enum) {
      return (
        <Select>
          {propertyValue.enum.map(enumValue => (
            <Select.Option value={enumValue} key={enumValue}>
              {enumValue}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input />;
  }

  if (type === 'boolean') {
    return <Switch />;
  }

  if (type === 'number' || type === 'integer') {
    return (
      <InputNumber
        min={minimum ?? Number.MIN_SAFE_INTEGER}
        max={maximum ?? Number.MAX_SAFE_INTEGER}
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
        console.log(name, data);

        const propertyDefaultData = {};
        Object.entries(data.properties || {}).forEach(([propertyName, propertyValue]) => {
          if (propertyValue.hasOwnProperty('default')) {
            propertyDefaultData[propertyName] = propertyValue.default;
          }
        });
        form.setFieldsValue(propertyDefaultData);

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

    const { type, minLength, maxLength, minimum, maximum, pattern } = propertyValue;

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
    const customPattern = pattern ? [{ pattern: new RegExp(pattern) }] : [];

    const rules = [
      ...requiredRule,
      ...typeRule,
      ...enumRule,
      ...rangeRule,
      ...lengthRule,
      ...customPattern,
    ];
    const flattend = rules.reduce((prev, next) => ({ ...prev, ...next }));
    return [flattend] as Rule[];
  };

  const renderArrayComponent = (propertyName: string, propertyValue: PluginProperty) => (
    <Form.List key={propertyName} name={propertyName}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item
              key={field.key}
              rules={calculateRules(propertyName, propertyValue)}
              label={`${propertyName}-${index + 1}`}
            >
              <Form.Item
                {...field}
                valuePropName={propertyValue.type === 'boolean' ? 'checked' : 'value'}
                noStyle
              >
                {/* NOTE: When property type is array, the property.items' type is string currently. */}
                {renderComponentByProperty({ type: 'string' })}
              </Form.Item>
              {fields.length > 1 ? (
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              ) : (
                <React.Fragment />
              )}
            </Form.Item>
          ))}
          <Form.Item label={propertyName}>
            <Button type="dashed" onClick={add}>
              {/* TODO: i18n */}
              <PlusOutlined /> Add
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );

  return (
    // TODO: i18n
    <Modal destroyOnClose visible={visible} title={`编辑插件：${name}`}>
      <Form {...formLayout} form={form} onFinish={onFinish}>
        {Object.entries(schema?.properties || {}).map(([propertyName, propertyValue]) => {
          // eslint-disable-next-line arrow-body-style
          if (propertyValue.type === 'array') {
            return renderArrayComponent(propertyName, propertyValue);
          }

          // TODO: object

          return (
            <Form.Item
              label={propertyName}
              name={propertyName}
              key={propertyName}
              rules={calculateRules(propertyName, propertyValue)}
              valuePropName={propertyValue.type === 'boolean' ? 'checked' : 'value'}
            >
              {renderComponentByProperty(propertyValue)}
            </Form.Item>
          );
        })}
      </Form>
    </Modal>
  );
};

export default PluginModal;
