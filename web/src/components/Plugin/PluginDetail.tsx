/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useRef } from 'react';
import { Button, notification, PageHeader, Switch, Form, Select, Divider } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { js_beautify } from 'js-beautify';
import { LinkOutlined } from '@ant-design/icons';

import Ajv, { DefinedError } from 'ajv';
import { fetchSchema } from './service';

type Props = {
  name: string;
  type?: 'global' | 'scoped',
  schemaType: PluginComponent.Schema,
  initialData: object,
  readonly?: boolean;
  onClose?: () => void;
  onChange?: (data: any) => void;
};

const ajv = new Ajv();

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 1,
  },
  wrapperCol: {
    span: 16,
  },
};

// NOTE: This function has side effect because it mutates the original schema data
const injectDisableProperty = (schema: Record<string, any>) => {
  // NOTE: The frontend will inject the disable property into schema just like the manager-api does
  if (!schema.properties) {
    // eslint-disable-next-line
    schema.properties = {};
  }
  // eslint-disable-next-line
  (schema.properties as any).disable = {
    type: 'boolean',
  };
  return schema;
};


const PluginDetail: React.FC<Props> = ({
  name,
  type = 'scoped',
  schemaType = 'route',
  readonly = false,
  initialData = {},
  onClose = () => { },
  onChange = () => { },
}) => {
  const [form] = Form.useForm();
  const ref = useRef<any>(null);
  const data = initialData[name];

  const validateData = (pluginName: string, value: PluginComponent.Data) => {
    return fetchSchema(pluginName, schemaType).then((schema) => {
      return new Promise((resolve) => {
        if (schema.oneOf) {
          (schema.oneOf || []).forEach((item: any) => {
            injectDisableProperty(item);
          });
        } else {
          injectDisableProperty(schema);
        }

        const validate = ajv.compile(schema);

        if (validate(value)) {
          resolve(value)
          return;
        }

        // eslint-disable-next-line
        for (const err of validate.errors as DefinedError[]) {
          let description = '';
          switch (err.keyword) {
            case 'enum':
              description = `${err.dataPath} ${err.message}: ${err.params.allowedValues.join(
                ', ',
              )}`;
              break;
            case 'minItems':
            case 'type':
              description = `${err.dataPath} ${err.message}`;
              break;
            case 'oneOf':
            case 'required':
              description = err.message || '';
              break;
            default:
              description = `${err.schemaPath} ${err.message}`;
          }
          notification.error({
            message: 'Invalid plugin data',
            description,
          });
        }
      })
    });
  };

  const formatCodes = () => {
    try {
      if (ref.current) {
        ref.current.editor.setValue(
          js_beautify(ref.current.editor.getValue(), {
            indent_size: 2,
          }),
        );
      }
    } catch (error) {
      notification.error({
        message: 'Format failed',
      });
    }
  };

  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={onClose}
        title={`Plugin: ${name}`}
        extra={[
          <Button onClick={onClose}>取消</Button>,
          <Button key="1" type="primary" onClick={() => {
            try {
              if (!form.getFieldsValue().disable) {
                onChange({ formData: form.getFieldsValue(), codemirrorData: {} });
                onClose();
                return;
              }
              const editorData = JSON.parse(ref.current?.editor.getValue());
              validateData(name, editorData).then(value => {
                onChange({ formData: form.getFieldsValue(), codemirrorData: value });
                onClose();
              });
            } catch (error) {
              notification.error({
                message: 'Invalid JSON data',
              });
            }
          }}>
            确定
          </Button>,
        ]}
      />
      <style>
        {`
        .site-page-header {
          border: 1px solid rgb(235, 237, 240);
          margin-top:10px;
        }
      `}
      </style>

      <Form {...FORM_ITEM_LAYOUT} style={{ marginTop: '10px' }} form={form}>
        <Form.Item label="Enable" name='disable'>
          <Switch
            defaultChecked={initialData[name] && !initialData[name].disable}
            disabled={readonly}
          />
        </Form.Item>
        {type === 'global' && <Form.Item label="Scope">
          <Select>
            <Select.Option value="global">global</Select.Option>
            <Select.Option value="scoped">scoped</Select.Option>
          </Select>
        </Form.Item>}
      </Form>
      <Divider orientation="left">Data Editor</Divider>
      <PageHeader
        title=""
        subTitle={`Current Plugin: ${name}`}
        ghost={false}
        extra={[
          <Button
            type="default"
            icon={<LinkOutlined />}
            onClick={() => {
              window.open(`https://github.com/apache/apisix/blob/master/doc/plugins/${name}.md`);
            }}
            key={1}
          >
            Document
            </Button>,
          <Button type="primary" onClick={formatCodes} key={2}>
            Format
            </Button>,
        ]}
      >
        <CodeMirror
          ref={ref}
          value={JSON.stringify(data, null, 2)}
          options={{
            mode: 'json-ld',
            readOnly: readonly ? 'nocursor' : '',
            lineWrapping: true,
            lineNumbers: true,
            showCursorWhenSelecting: true,
            autofocus: true,
          }}
        />
      </PageHeader>
    </>
  );
};

export default PluginDetail;
