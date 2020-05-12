import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Modal, notification } from 'antd';
import { history, formatMessage } from 'umi';
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
        type: 'primary',
        danger: true,
      },
      onOk: () =>
        removeSSL(key).then(() => {
          notification.success({
            message: formatMessage({ id: 'component.ssl.removeSSLSuccess' }),
          });
          /* eslint-disable no-unused-expressions */
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
          <Button
            type="primary"
            style={{ marginRight: '10px' }}
            onClick={() => history.push(`/ssl/${record.key}/edit`)}
          >
            {formatMessage({ id: 'component.global.edit' })}
          </Button>
          <Button type="primary" danger onClick={() => onRemove(record.key)}>
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
          <Button type="primary" onClick={() => history.push(`/ssl/create`)}>
            <PlusOutlined />
            {formatMessage({ id: 'component.global.create' })}
          </Button>,
        ]}
      />
    </PageHeaderWrapper>
  );
};

export default List;
