import React, {useRef} from "react";
import ProTable, {ActionType, ProColumns} from "@ant-design/pro-table";
import {ListItem} from "@/transforms/global";
import {fetchList as fetchRouteList} from "@/services/routes";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import {Routes} from "@/models/routes";
import {formatMessage} from "umi-plugin-react/locale";
import {PlusOutlined} from '@ant-design/icons';
import {Button, Modal, notification} from "antd";
import {router} from "umi";
import {remove as removeSSL} from "@/services/ssl";


const List: React.FC = () => {
  const tableRef = useRef<ActionType>();

  const onRemove = (key: string) => {
    Modal.confirm({
      title: formatMessage({ id: 'component.ssl.removeSSLItemModalTitle' }),
      content: formatMessage({ id: 'component.ssl.removeSSLItemModalContent' }),
      okText: formatMessage({ id: 'component.global.remove' }),
      cancelText: formatMessage({ id: 'component.global.cancel' }),
      okButtonProps: {
        type: 'danger',
      },
      onOk: () =>
        removeSSL(key).then(() => {
          notification.success({
            message: formatMessage({ id: 'component.ssl.removeSSLSuccess' }),
          });
          tableRef.current?.reload();
        }),
    });
  };

  const columns: ProColumns<ListItem<Routes>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
      sortOrder: 'descend',
    },
    {
      title: formatMessage({ id: 'component.global.description' }),
      dataIndex: ['value', 'desc'],
    },
    {
      title: 'uri',
      dataIndex: ['value', 'uris'],
      renderText: (text) => {
        return text ? text.join(', ') : '';
      }
    },
    {
      title: 'host',
      dataIndex: ['value', 'hosts'],
      renderText: (text) => {
        return text ? text.join(' ') : '';
      }
    },
    {
      title: 'remote_addr',
      dataIndex: ['value', 'remote_addr'],
    },
    {
      title: 'upstream_id',
      dataIndex: ['value', 'upstream_id'],
    },
    {
      title: 'service_id',
      dataIndex: ['value', 'service_id'],
    },
    {
      title: 'methods',
      dataIndex: ['value', 'methods'],
      renderText: (text) => {
        return text ? text.join(', ') : '';
      }
    },
    {
      title: 'plugins',
      dataIndex: ['value', 'plugins'],
      renderText: (text) => {
        return text ? Object.keys(text).join(', ') : '';
      }
    },
    {
      title: formatMessage({ id: 'component.global.action' }),
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            style={{ marginRight: '10px' }}
            onClick={() => router.push(`/routes/${record.key}/edit`)}
          >
            {formatMessage({ id: 'component.global.edit' })}
          </Button>
          <Button type="danger" onClick={() => onRemove(record.key)}>
            {formatMessage({ id: 'component.global.remove' })}
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem<Routes>>
        request={() => fetchRouteList()}
        search={false}
        columns={columns}
        scroll={{ x: true }}
        actionRef={tableRef}
        bordered={true}
        toolBarRender={() => [
          <Button type="primary" onClick={() => router.push(`/routes/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
}

export default List;
