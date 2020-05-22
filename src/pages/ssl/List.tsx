import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Button, Modal, notification, Switch } from 'antd';
import { history, useIntl } from 'umi';
import { PlusOutlined } from '@ant-design/icons';

import { fetchList as fetchSSLList, remove as removeSSL } from './service';
import { ListItem } from '@/transforms/global';

interface SearchParamsProps {
  current: number;
  pageSize: number;
  sni: string;
}

const List: React.FC = () => {
  const tableRef = useRef<ActionType>();
  const [list, setList] = useState<ListItem<SSLModule.SSL>[]>([]);
  const { formatMessage } = useIntl();
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
          // NOTE: tricky way
          setList([]);
          requestAnimationFrame(() => tableRef.current?.reload());
        }),
    });
  };

  const columns: ProColumns<ListItem<SSLModule.SSL>>[] = [
    {
      title: 'ID',
      dataIndex: 'displayKey',
      sortOrder: 'descend',
      hideInSearch: true,
    },
    {
      title: 'SNI',
      dataIndex: ['value', 'sni'],
      key: 'sni',
    },
    {
      title: '过期时间',
      dataIndex: 'expiredTime',
      hideInSearch: true,
    },
    {
      title: '是否启用',
      valueType: 'option',
      render: () => (
        <>
          <Switch defaultChecked />
        </>
      ),
    },
    {
      title: formatMessage({ id: 'component.global.action' }),
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button type="primary" danger onClick={() => onRemove(record.key)}>
            {formatMessage({ id: 'component.global.remove' })}
          </Button>
        </>
      ),
    },
  ];

  const fetchPageSSLList = (params: Partial<SearchParamsProps> | undefined) => {
    if (list.length) {
      const result = list.filter((item) => {
        if (params?.sni) {
          return item.value.sni.includes(params.sni);
        }
        return true;
      });
      return Promise.resolve({ data: result, total: list.length });
    }
    return fetchSSLList().then((data) => {
      setList(data.data);
      return data;
    });
  };

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem<SSLModule.SSL>>
        request={(params) => fetchPageSSLList(params)}
        search
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
