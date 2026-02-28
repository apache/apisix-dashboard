/**
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
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { TablePaginationConfig } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AntdConfigProvider } from '@/config/antdConfigProvider';

import PageHeader from './PageHeader';
import { ToAddPageBtn } from './ToAddPageBtn';

interface ResourceListPageProps<T> {
    titleKey?: string;
    columns: ProColumns<T>[];
    queryData: {
        data?: { list: T[]; total: number;[key: string]: unknown } | undefined;
        isLoading: boolean;
        pagination: TablePaginationConfig | false;
        refetch?: () => void;
    };
    rowKey: string | ((record: T) => string);
    addPageTo?: string;
    resourceNameKey?: string;
    emptyText?: React.ReactNode;
    pageSizeOptions?: number[] | string[];
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
}

const ResourceListPage = <T extends Record<string, unknown>>(
    props: ResourceListPageProps<T>
) => {
    const {
        titleKey,
        columns,
        queryData,
        rowKey,
        addPageTo,
        resourceNameKey,
        emptyText,
        pageSizeOptions,
        showTotal: customShowTotal,
    } = props;
    const { t } = useTranslation();
    const { data, isLoading, pagination } = queryData;

    const dataSource = useMemo(() => (data?.list as unknown as T[]) ?? [], [data]);
    const total = (pagination !== false ? pagination?.total : undefined) ?? data?.total ?? 0;

    const paginationConfig = useMemo(() => {
        if (pagination === false) return false;

        return {
            current: pagination?.current ?? 1,
            pageSize: pagination?.pageSize ?? 10,
            total,
            showSizeChanger: true,
            pageSizeOptions: pageSizeOptions ?? [10, 20, 50, 100],
            hideOnSinglePage: false,
            onChange: pagination?.onChange,
            ...(customShowTotal ? { showTotal: customShowTotal } : {}),
        };
    }, [pagination, total, pageSizeOptions, customShowTotal]);

    return (
        <AntdConfigProvider>
            {titleKey && <PageHeader title={t(titleKey as never)} />}
            <ProTable<T>
                columns={columns}
                dataSource={dataSource}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rowKey={typeof rowKey === 'string' ? (record: any) => record.value?.[rowKey] ?? record[rowKey] : rowKey}
                loading={isLoading}
                search={false}
                options={false}
                pagination={paginationConfig}
                cardProps={{ bodyStyle: { padding: 0 } }}
                locale={
                    emptyText
                        ? { emptyText }
                        : undefined
                }
                toolBarRender={() => [
                    addPageTo && resourceNameKey && (
                        <ToAddPageBtn
                            key="create"
                            to={addPageTo as never}
                            label={t('info.add.title' as never, {
                                name: t(resourceNameKey as never),
                            })}
                        />
                    ),
                ]}
            />
        </AntdConfigProvider>
    );
};

export default ResourceListPage;
