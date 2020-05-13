import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Modal, notification, Switch } from 'antd';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';
import { PlusOutlined } from '@ant-design/icons';

import { fetchList as fetchSSLList, remove as removeSSL } from '@/services/ssl';
import { SSL } from '@/models/ssl';
import { ListItem } from '@/transforms/global';

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

  const columns: ProColumns<ListItem<SSL>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
      sortOrder: 'descend',
    },
    {
      title: 'SNI',
      dataIndex: ['value', 'sni'],
    },
    {
      title: formatMessage({ id: 'component.global.action' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="不启用"
            defaultChecked
            style={{ marginRight: '8px' }}
          />
          <Button type="danger" onClick={() => onRemove(record.key)}>
            {formatMessage({ id: 'component.global.remove' })}
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem<SSL>>
        request={() => fetchSSLList()}
        search={false}
        columns={columns}
        actionRef={tableRef}
        toolBarRender={() => [
          <Button type="primary" onClick={() => router.push(`/ssl/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default List;
