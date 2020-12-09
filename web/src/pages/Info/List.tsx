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
import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';

import styles from './Info.less';

const nodeDetail = [
  {
    id: 'ddea4053-4ffd-4f09-b176-b8c5e919916b',
    hostname: 'localhost.local',
    version: '2.0',
    etcd_version: '3.5.0',
    uptime: 3600,
    last_report_at: 1606121591,
    boot_time: 1606121501,
  },
];

const nodeListData = [
  {
    id: 'ddea4053-4ffd-4f09-b176-b8c5e919916b',
    name: 'node1',
  },
  {
    id: 'ddea4053-4ffd-4f09-b176-b8c5e919916c',
    name: 'node2',
  },
  {
    id: 'ddea4053-4ffd-4f09-b176-b8c5e919916a',
    name: 'node3',
  },
];

const Info: React.FC = () => {
  const [data, setData] = useState<NodeDetail[]>([]);
  const [nodeList, setNodeList] = useState<NodeListData[]>([]);
  const { formatMessage } = useIntl();
  const { Option } = Select;

  useEffect(() => {
    setNodeList(nodeListData);
  }, []);

  return (
    <PageContainer title={formatMessage({ id: 'page.info.pageContainer.title' })}>
      <div className={styles.select}>
        <Select
          style={{ width: '210px' }}
          placeholder="Please select node name"
          onChange={(value) => {
            const arr = nodeDetail.filter((item) => {
              return item.id === value;
            });
            setData(arr);
          }}
        >
          {nodeList.map((item) => (
            <Option key={item.name} value={item.id}>
              {item.name}
            </Option>
          ))}
          ;
        </Select>
      </div>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <tbody>
            {Object.entries(data[0] || {}).map((item) => {
              return (
                <tr>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default Info;
