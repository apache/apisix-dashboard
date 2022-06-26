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
import React, { memo, useState } from 'react';
import {
  Button,
  Col,
  Collapse,
  Divider,
  Drawer,
  Form,
  Input,
  notification,
  Result,
  Row,
  Select,
  Space,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import OpenAPI3 from './loader/OpenAPI3';
import type { RcFile } from 'antd/lib/upload';
import { importRoutes } from '@/pages/Route/service';

type Props = {
  onClose: (finish: boolean) => void;
};

type ImportType = 'openapi3' | 'openapi_legacy';
type ImportState = 'import' | 'result';
type ImportResult = {
  success: boolean;
  data: Record<
    string,
    {
      total: number;
      failed: number;
      errors: string[];
    }
  >;
};

const entityNames = [
  'route',
  'upstream',
  'service',
  'consumer',
  'ssl',
  'stream_route',
  'global_rule',
  'plugin_config',
  'proto',
];

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
  const { onClose } = props;
  const [importType, setImportType] = useState<ImportType>('openapi3');
  const [uploadFileList, setUploadFileList] = useState<RcFile[]>([]);
  const [state, setState] = useState<ImportState>('import');
  const [importResult, setImportResult] = useState<ImportResult>({
    success: true,
    data: {},
  });

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

    importRoutes(formData)
      .then((r) => {
        let errorNumber = 0;
        entityNames.forEach((v) => {
          errorNumber += r.data[v].failed;
        });

        setImportResult({
          success: errorNumber <= 0,
          data: r.data,
        });
        setState('result');
      })
      .catch(() => {});
  };

  return (
    <Drawer
      title={formatMessage({ id: 'page.route.data_loader.import_panel' })}
      width={480}
      visible={true}
      onClose={() => onClose(false)}
      footer={
        <div
          style={{
            display: state === 'result' ? 'none' : 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={() => onClose(false)}>
            {formatMessage({ id: 'component.global.cancel' })}
          </Button>
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
      {state === 'import' && (
        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label={formatMessage({ id: 'page.route.data_loader.labels.loader_type' })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'page.route.data_loader.tips.select_type' }),
                  },
                ]}
                initialValue={importType}
              >
                <Select onChange={(value: ImportType) => setImportType(value)}>
                  <Select.Option value="openapi3">
                    {formatMessage({ id: 'page.route.data_loader.types.openapi3' })}
                  </Select.Option>
                  <Select.Option value="openapi_legacy" disabled>
                    {formatMessage({ id: 'page.route.data_loader.types.openapi_legacy' })}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="task_name"
                label={formatMessage({ id: 'page.route.data_loader.labels.task_name' })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'page.route.data_loader.tips.input_task_name' }),
                  },
                ]}
              >
                <Input
                  placeholder={formatMessage({
                    id: 'page.route.data_loader.tips.input_task_name',
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Option type={importType}></Option>
          <Divider />
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={formatMessage({ id: 'page.route.data_loader.labels.upload' })}>
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
                  <Button icon={<UploadOutlined />}>
                    {formatMessage({ id: 'page.route.data_loader.tips.click_upload' })}
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
      {state === 'result' && (
        <Result
          status={importResult.success ? 'success' : 'error'}
          title={`${formatMessage({ id: 'page.route.data_loader.import' })} ${
            importResult.success
              ? formatMessage({ id: 'component.status.success' })
              : formatMessage({ id: 'component.status.fail' })
          }`}
          extra={[
            <Button
              type="primary"
              onClick={() => {
                setState('import');
                onClose(true);
              }}
            >
              {formatMessage({ id: 'menu.close' })}
            </Button>,
          ]}
        >
          <Collapse>
            {entityNames.map((v) => {
              if (importResult.data[v] && importResult.data[v].total > 0) {
                return (
                  <Collapse.Panel
                    collapsible={importResult.data[v].failed > 0 ? 'header' : 'disabled'}
                    header={`Total ${importResult.data[v].total} ${v} imported, ${importResult.data[v].failed} failed`}
                    key={v}
                  >
                    {importResult.data[v].errors &&
                      importResult.data[v].errors.map((err) => <p>{err}</p>)}
                  </Collapse.Panel>
                );
              }
              return null;
            })}
          </Collapse>
        </Result>
      )}
    </Drawer>
  );
};

export default memo(DataLoaderImport);
