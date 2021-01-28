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
import React, { useRef, useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import {
  Button,
  Popconfirm,
  notification,
  Tag,
  Space,
  Select,
  Radio,
  Form,
  Upload,
  Modal,
  Divider,
} from 'antd';
import { history, useIntl } from 'umi';
import { PlusOutlined, BugOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { js_beautify } from 'js-beautify';
import yaml from 'js-yaml';
import moment from 'moment';
import { saveAs } from 'file-saver';

import { timestampToLocaleString } from '@/helpers';
import type { RcFile } from 'antd/lib/upload';
import {
  fetchList,
  remove,
  fetchLabelList,
  updateRouteStatus,
  exportRoutes,
  importRoutes,
} from './service';
import { DebugDrawView } from './components/DebugViews';
import { EXPORT_FILE_MIME_TYPE_SUPPORTED } from './constants';

const { OptGroup, Option } = Select;

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();
  const [exportFileTypeForm] = Form.useForm();

  enum RouteStatus {
    Offline = 0,
    Publish,
  }

  enum ExportFileType {
    JSON = 0,
    YAML,
  }

  const [labelList, setLabelList] = useState<RouteModule.LabelList>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [uploadFileList, setUploadFileList] = useState<RcFile[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchLabelList().then(setLabelList);
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (currentSelectKeys: string[]) => {
      setSelectedRowKeys(currentSelectKeys);
    },
    preserveSelectedRowKeys: true,
  };

  const handleTableActionSuccessResponse = (msgTip: string) => {
    notification.success({
      message: msgTip,
    });

    ref.current?.reload();
  };

  const handlePublishOffline = (rid: string, status: RouteModule.RouteStatus) => {
    updateRouteStatus(rid, status).then(() => {
      const actionName = status
        ? formatMessage({ id: 'page.route.publish' })
        : formatMessage({ id: 'page.route.offline' });
      handleTableActionSuccessResponse(
        `${actionName} ${formatMessage({
          id: 'menu.routes',
        })} ${formatMessage({ id: 'component.status.success' })}`,
      );
    });
  };

  const handleExport = (exportFileType: ExportFileType) => {
    exportRoutes(selectedRowKeys.join(',')).then((resp) => {
      let exportFile: string;
      let exportFileName = `APISIX_routes_${moment().format('YYYYMMDDHHmmss')}`;

      switch (exportFileType) {
        case ExportFileType.YAML:
          exportFile = yaml.dump(resp.data);
          exportFileName = `${exportFileName}.${ExportFileType[
            ExportFileType.YAML
          ].toLocaleLowerCase()}`;
          break;
        case ExportFileType.JSON:
        default:
          exportFile = js_beautify(JSON.stringify(resp.data), {
            indent_size: 2,
          });
          exportFileName = `${exportFileName}.${ExportFileType[
            ExportFileType.JSON
          ].toLocaleLowerCase()}`;
          break;
      }

      const blob = new Blob([exportFile], {
        type: EXPORT_FILE_MIME_TYPE_SUPPORTED[exportFileType],
      });

      saveAs(window.URL.createObjectURL(blob), exportFileName);
    });
  };

  const handleImport = () => {
    const formData = new FormData();
    if (!uploadFileList[0]) {
      notification.warn({
        message: formatMessage({ id: 'page.route.button.selectFile' }),
      });
      return;
    }
    formData.append('file', uploadFileList[0]);

    importRoutes(formData).then(() => {
      handleTableActionSuccessResponse(
        `${formatMessage({ id: 'page.route.button.importOpenApi' })} ${formatMessage({
          id: 'component.status.success',
        })}`,
      );
      setShowImportModal(false);
    });
  };

  const ListFooter: React.FC = () => {
    return (
      <Popconfirm
        title={
          <Form form={exportFileTypeForm} initialValues={{ fileType: ExportFileType.JSON }}>
            <div style={{ marginBottom: 8 }}>
              {formatMessage({ id: 'page.route.exportRoutesTips' })}
            </div>
            <Form.Item name="fileType" noStyle>
              <Radio.Group>
                <Radio value={ExportFileType.JSON}>Json</Radio>
                <Radio value={ExportFileType.YAML}>Yaml</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        }
        onConfirm={() => {
          handleExport(exportFileTypeForm.getFieldValue('fileType'));
        }}
        okText={formatMessage({ id: 'component.global.confirm' })}
        cancelText={formatMessage({ id: 'component.global.cancel' })}
        disabled={selectedRowKeys.length === 0}
      >
        <Button type="primary" disabled={selectedRowKeys.length === 0}>
          <ExportOutlined />
          {formatMessage({ id: 'page.route.button.exportOpenApi' })}
        </Button>
      </Popconfirm>
    );
  };

  const [debugDrawVisible, setDebugDrawVisible] = useState(false);

  const columns: ProColumns<RouteModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'page.route.domainName' }),
      hideInSearch: true,
      render: (_, record) => {
        const list = record.hosts || (record.host && [record.host]) || [];

        return list.map((item) => (
          <Tag key={item} color="geekblue">
            {item}
          </Tag>
        ));
      },
    },
    {
      title: formatMessage({ id: 'page.route.path' }),
      render: (_, record) => {
        const list = record.uris || (record.uri && [record.uri]) || [];

        return list.map((item) => (
          <Tag key={item} color="geekblue">
            {item}
          </Tag>
        ));
      },
    },
    {
      title: formatMessage({ id: 'component.global.description' }),
      dataIndex: 'desc',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'component.global.labels' }),
      dataIndex: 'labels',
      render: (_, record) => {
        return Object.keys(record.labels || {})
          .filter((item) => item !== 'API_VERSION')
          .map((item) => (
            <Tag key={Math.random().toString(36).slice(2)}>
              {item}:{record.labels[item]}
            </Tag>
          ));
      },
      renderFormItem: (_, { type }) => {
        if (type === 'form') {
          return null;
        }

        return (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              return (
                <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                  {value}
                </Tag>
              );
            }}
          >
            {Object.keys(labelList)
              .filter((item) => item !== 'API_VERSION')
              .map((key) => {
                return (
                  <OptGroup label={key} key={Math.random().toString(36).slice(2)}>
                    {(labelList[key] || []).map((value: string) => (
                      <Option key={Math.random().toString(36).slice(2)} value={`${key}:${value}`}>
                        {' '}
                        {value}{' '}
                      </Option>
                    ))}
                  </OptGroup>
                );
              })}
          </Select>
        );
      },
    },
    {
      title: formatMessage({ id: 'component.global.version' }),
      dataIndex: 'API_VERSION',
      render: (_, record) => {
        return Object.keys(record.labels || {})
          .filter((item) => item === 'API_VERSION')
          .map((item) => record.labels[item]);
      },
      renderFormItem: (_, { type }) => {
        if (type === 'form') {
          return null;
        }

        return (
          <Select style={{ width: '100%' }} allowClear>
            {Object.keys(labelList)
              .filter((item) => item === 'API_VERSION')
              .map((key) => {
                return (
                  <OptGroup label={key} key={Math.random().toString(36).slice(2)}>
                    {(labelList[key] || []).map((value: string) => (
                      <Option key={Math.random().toString(36).slice(2)} value={`${key}:${value}`}>
                        {' '}
                        {value}{' '}
                      </Option>
                    ))}
                  </OptGroup>
                );
              })}
          </Select>
        );
      },
    },
    {
      title: formatMessage({ id: 'page.route.status' }),
      dataIndex: 'status',
      render: (_, record) => (
        <>
          {record.status ? (
            <Tag color="green">{formatMessage({ id: 'page.route.published' })}</Tag>
          ) : (
            <Tag color="red">{formatMessage({ id: 'page.route.unpublished' })}</Tag>
          )}
        </>
      ),
      renderFormItem: (_, { type }) => {
        if (type === 'form') {
          return null;
        }

        return (
          <Select style={{ width: '100%' }} allowClear>
            <Option key={RouteStatus.Offline} value={RouteStatus.Offline}>
              {formatMessage({ id: 'page.route.unpublished' })}
            </Option>
            <Option key={RouteStatus.Publish} value={RouteStatus.Publish}>
              {formatMessage({ id: 'page.route.published' })}
            </Option>
          </Select>
        );
      },
    },
    {
      title: formatMessage({ id: 'component.global.updateTime' }),
      dataIndex: 'update_time',
      hideInSearch: true,
      render: (text) => timestampToLocaleString(text as number),
    },
    {
      title: formatMessage({ id: 'component.global.operation' }),
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => (
        <>
          <Space align="baseline">
            {!record.status ? (
              <Button
                type="primary"
                onClick={() => {
                  handlePublishOffline(record.id, RouteStatus.Publish);
                }}
              >
                {formatMessage({ id: 'page.route.publish' })}
              </Button>
            ) : null}
            {record.status ? (
              <Popconfirm
                title={formatMessage({ id: 'page.route.popconfirm.title.offline' })}
                onConfirm={() => {
                  handlePublishOffline(record.id, RouteStatus.Offline);
                }}
                okButtonProps={{
                  danger: true,
                }}
                okText={formatMessage({ id: 'component.global.confirm' })}
                cancelText={formatMessage({ id: 'component.global.cancel' })}
              >
                <Button type="primary" danger disabled={Boolean(!record.status)}>
                  {formatMessage({ id: 'page.route.offline' })}
                </Button>
              </Popconfirm>
            ) : null}
            <Button type="primary" onClick={() => history.push(`/routes/${record.id}/edit`)}>
              {formatMessage({ id: 'component.global.edit' })}
            </Button>
            <Popconfirm
              title={formatMessage({ id: 'component.global.popconfirm.title.delete' })}
              onConfirm={() => {
                remove(record.id!).then(() => {
                  handleTableActionSuccessResponse(
                    `${formatMessage({ id: 'component.global.delete' })} ${formatMessage({
                      id: 'menu.routes',
                    })} ${formatMessage({ id: 'component.status.success' })}`,
                  );
                });
              }}
              okButtonProps={{
                danger: true,
              }}
              okText={formatMessage({ id: 'component.global.confirm' })}
              cancelText={formatMessage({ id: 'component.global.cancel' })}
            >
              <Button type="primary" danger>
                {formatMessage({ id: 'component.global.delete' })}
              </Button>
            </Popconfirm>
          </Space>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper
      title={`${formatMessage({ id: 'menu.routes' })} ${formatMessage({
        id: 'component.global.list',
      })}`}
    >
      <ProTable<RouteModule.ResponseBody>
        actionRef={ref}
        rowKey="id"
        columns={columns}
        request={fetchList}
        search={{
          searchText: formatMessage({ id: 'component.global.search' }),
          resetText: formatMessage({ id: 'component.global.reset' }),
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => history.push(`/routes/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
          <Button
            type="primary"
            onClick={() => {
              setUploadFileList([]);
              setShowImportModal(true);
            }}
          >
            <ImportOutlined />
            {formatMessage({ id: 'page.route.button.importOpenApi' })}
          </Button>,
          <Button type="primary" onClick={() => setDebugDrawVisible(true)}>
            <BugOutlined />
            {formatMessage({ id: 'page.route.onlineDebug' })}
          </Button>,
        ]}
        rowSelection={rowSelection}
        footer={() => <ListFooter />}
        tableAlertRender={false}
      />
      <DebugDrawView
        visible={debugDrawVisible}
        onClose={() => {
          setDebugDrawVisible(false);
        }}
      />

      <Modal
        title={formatMessage({ id: 'page.route.button.importOpenApi' })}
        visible={showImportModal}
        okText={formatMessage({ id: 'component.global.confirm' })}
        onOk={handleImport}
        onCancel={() => {
          setShowImportModal(false);
        }}
      >
        <Upload
          fileList={uploadFileList}
          beforeUpload={(file) => {
            setUploadFileList([file]);
            return false;
          }}
          onRemove={() => {
            setUploadFileList([]);
          }}
        >
          <Button type="primary" icon={<ImportOutlined />}>
            {formatMessage({ id: 'page.route.button.selectFile' })}
          </Button>
        </Upload>
        <Divider />
        <div>
          <p>{formatMessage({ id: 'page.route.instructions' })}:</p>
          <p>
            <a
              href="https://github.com/apache/apisix-dashboard/blob/master/docs/IMPORT_OPENAPI_USER_GUIDE.md"
              target="_blank"
            >
              1.{' '}
              {`${formatMessage({ id: 'page.route.import' })} ${formatMessage({
                id: 'page.route.instructions',
              })}`}
            </a>
          </p>
        </div>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default Page;
