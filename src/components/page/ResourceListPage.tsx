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

import type { APISIXListResponse } from '@/types/schema/apisix/type';

import PageHeader from './PageHeader';
import { ToAddPageBtn } from './ToAddPageBtn';

interface ResourceListPageProps<T> {
    titleKey?: string;
    columns: ProColumns<T>[];
    queryHook: () => {
        data?: APISIXListResponse<T> | undefined;
        isLoading: boolean;
        pagination: TablePaginationConfig | false;
        refetch?: () => void;
    };
    rowKey: string;
    addPageTo?: string;
    resourceNameKey?: string;
    emptyKey?: string;
}

const ResourceListPage = <T extends Record<string, unknown>>(
    props: ResourceListPageProps<T>
) => {
    const {
        titleKey,
        columns,
        queryHook,
        rowKey,
        addPageTo,
        resourceNameKey,
        emptyKey,
    } = props;
    const { t } = useTranslation();
    const { data, isLoading, pagination } = queryHook();

    const dataSource = useMemo(() => (data?.list as T[]) ?? [], [data]);
    const total = pagination?.total ?? data?.total ?? 0;

    const paginationConfig = useMemo(() => {
        if (pagination === false) return false;

        return {
            current: pagination?.current ?? 1,
            pageSize: pagination?.pageSize ?? 10,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            onChange: pagination?.onChange,
            showTotal: (total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} items`,
        };
    }, [pagination, total]);

    return (
        <>
            {titleKey && <PageHeader title={t(titleKey as never)} />}
            <ProTable<T>
                columns={columns}
                dataSource={dataSource}
                rowKey={rowKey}
                loading={isLoading}
                search={false}
                options={{ reload: true, density: true, setting: true }}
                pagination={paginationConfig}
                cardProps={{ bodyStyle: { padding: 0 } }}
                locale={
                    emptyKey
                        ? {
                            emptyText: t(emptyKey as never),
                        }
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
        </>
    );
};

export default ResourceListPage;
