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

const nodeData = [
  {
    category: 'system',
    name: 'version',
    value: '2.0',
  },
  {
    category: 'system',
    name: 'apisix_id',
    value: '2.1',
  },
  {
    category: 'system',
    name: 'apisix_id',
    value: '2.2',
  },
  {
    category: 'categoryA',
    name: 'keyA',
    value: 'valueA',
  },
  {
    category: 'categoryA',
    name: 'customKeyA',
    value: 'valueA',
  },
  {
    category: 'categoryB',
    name: 'customKeyB',
    value: 'valueB',
  },
  {
    category: 'categoryB',
    name: 'customKeyC',
    value: 'valueC',
  },
];

const nodeListData = [
  {
    key: 'system',
    value: 'value1',
  },
  {
    key: 'categoryA',
    value: 'value2',
  },
  {
    key: 'categoryB',
    value: 'value3',
  },
];

const Info: React.FC = () => {
  const [data, setData] = useState<NodeData[]>([]);
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
            const arr = nodeData.filter((item) => {
              return item.category === value;
            });
            setData(arr);
          }}
        >
          {nodeList.map((item) => (
            <Option key={item.key} value={item.key}>
              {item.key}
            </Option>
          ))}
          ;
        </Select>
      </div>
      <div className={styles.wrap}>
        <table className={styles.table}>
          {/* There are some problems here that the data is not obtained during the first load */}
          {/* <thead>
            <th>{data[0].category}</th>
            <th>&nbsp;</th>
          </thead> */}
          <tbody>
            {data.map((item) => {
              return (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.value}</td>
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
