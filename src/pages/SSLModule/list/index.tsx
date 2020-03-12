import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Button, Modal } from 'antd';
import { router } from 'umi';
import { formatMessage } from 'umi-plugin-react/locale';

import { fetchList as fetchSSLList } from '@/services/ssl';
import { SSL } from '@/models/ssl';
import { ListItem } from '@/transforms/global';

const List: React.FC = () => {
  const onRemove = (key: string) => {
    Modal.confirm({
      title: formatMessage({ id: 'component.ssl.removeSSLItemModalTitle' }),
      content: formatMessage({ id: 'component.ssl.removeSSLItemModalContent' }),
      okText: formatMessage({ id: 'component.global.remove' }),
      cancelText: formatMessage({ id: 'component.global.cancel' }),
      okButtonProps: {
        type: 'danger',
      },
      onOk: () => {
        console.log(key);
      },
    });
  };

  const columns: ProColumns<ListItem<SSL>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
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
            onClick={() => router.push(`/ssl/${record.key}/edit`)}
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
      <ProTable<ListItem<SSL>> request={() => fetchSSLList()} search={false} columns={columns} />
    </PageHeaderWrapper>
  );
};

export default List;
