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

import styles from './info.less';

const mydata = [
  {
    category: "system",
    name: "version",
    value: "2.0",
    name2: "apisix_id",
    value2: "2.1",
  },
  {
    category: "categoryA",
    name: "keyA",
    value: "valueA",
    name2: "customKeyA",
    value2: "valueKeyA",
  },
  {
    category: "categoryB",
    name: "keyB",
    value: "valueB",
    name2: "customKeyB",
    value2: "valueKeyB",
  },
  {
    category: "categoryC",
    name: "keyC",
    value: "valueC",
    name2: "customKeyC",
    value2: "valueKeyC",
  },
];

const data = [
  {
    key: "key1",
    value: "value1",
  },
  {
    key: "key2",
    value: "value2",
  },
  {
    key: "key3",
    value: "value3",
  },
];

const Info: React.FC = () => {
  const [detail, setDetail] = useState([] as any);
  const [nodeList, setNodeList] = useState([] as any);
  const { formatMessage } = useIntl();
  const { Option } = Select;

  useEffect(() => {
    setNodeList(data);
    console.log(setNodeList(data));
  });

  return (
    <PageContainer title={formatMessage({ id: 'page.info.pageContainer.title' })}>
      <div className={styles.select}>
        <Select
          showSearch
          style={{ width: "130px" }}
          placeholder="Please select"
          onChange={(value) => {
            console.log(value);
            setDetail(mydata);
          }}
        >
          {nodeList.map((item: any) => (
            <Option value={item.key} lable={item.key}>
              {item.key}
            </Option>
          ))};
      </Select>
      </div>
      <div className={styles.wrap}>
        {detail.map((item: any) => {
          return (
            <table id={item.category} className={styles.table}>
              <thead>
                <th>{item.category[0] && item.category}</th>
                <th>&nbsp;</th>
              </thead>
              <tbody>
                <tr>
                  <td>{item.name}</td>
                  <td style={{ textAlign: "right" }}>{item.value}</td>
                </tr>
                <tr>
                  <td>{item.name2}</td>
                  <td style={{ textAlign: "right" }}>{item.value2}</td>
                </tr>
              </tbody>
            </table>
          );
        })}
      </div>
    </PageContainer>
  );
};

export default Info;
