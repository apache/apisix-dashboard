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
import React, { useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  notification,
  Row,
  Select,
  Space,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import OpenAPI3 from './loader/OpenAPI3';
import { RcFile } from 'antd/lib/upload';
import { importRoutes } from '@/pages/Route/service';

type Props = {
  visible: boolean;
  onClose?: () => void;
  onFinish?: () => void;
};

type ImportType = 'openapi3' | 'openapi_legacy';

const Option: React.FC<{
  type: ImportType;
}> = ({ type }) => {
  switch (type) {
    case 'openapi_legacy':
      return <></>;
    case 'openapi3':
    default:
      return <OpenAPI3 />;
  }
};

const DataLoaderImport: React.FC<Props> = (props) => {
  const [form] = Form.useForm();
  const { formatMessage } = useIntl();
  const { visible, onClose } = props;
  const [importType, setImportType] = useState<ImportType>('openapi3');
  const [uploadFileList, setUploadFileList] = useState<RcFile[]>([]);

  const onFinish = (values: Record<string, string>) => {
    const formData = new FormData();
    if (!uploadFileList[0]) {
      notification.warn({
        message: formatMessage({ id: 'page.route.button.selectFile' }),
      });
      return;
    }
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    formData.append('file', uploadFileList[0]);

    importRoutes(formData).then(() => {
      notification.success({
        message: `${formatMessage({ id: 'page.route.data_loader.import' })} ${formatMessage({
          id: 'component.status.success',
        })}`,
      });
      if (props.onFinish) props.onFinish();
    });
  };

  return (
    <>
      <Drawer
        title={formatMessage({ id: 'page.route.data_loader.import_panel' })}
        width={720}
        visible={visible}
        onClose={onClose}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onClose}>{formatMessage({ id: 'component.global.cancel' })}</Button>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  form.submit();
                }}
              >
                {formatMessage({ id: 'component.global.submit' })}
              </Button>
            </Space>
          </div>
        }
      >
        <Form layout="vertical" form={form} onFinish={onFinish} hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Data Loader Type"
                rules={[{ required: true, message: 'Please select importer type' }]}
                initialValue={importType}
              >
                <Select onChange={(value: ImportType) => setImportType(value)}>
                  <Select.Option value="openapi3">OpenAPI 3</Select.Option>
                  <Select.Option value="openapi_legacy" disabled>
                    OpenAPI 3 Legacy
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="task_name"
                label="Task name"
                rules={[{ required: true, message: 'Please input import task name' }]}
              >
                <Input placeholder="Please input a task name" />
              </Form.Item>
            </Col>
          </Row>
          <Option type={importType}></Option>
          <Divider />
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Upload">
                <Upload
                  fileList={uploadFileList as any}
                  beforeUpload={(file) => {
                    setUploadFileList([file]);
                    return false;
                  }}
                  onRemove={() => {
                    setUploadFileList([]);
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default DataLoaderImport;
