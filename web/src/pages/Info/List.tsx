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
import React from 'react';
import { Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';

const Info: React.FC = () => {
  const { formatMessage } = useIntl();
  const { Option } = Select;
  const mydata = [
    {
      "category": "system",
      "name": "version",
      "value": "2.0",
      "name2": "apisix_id",
      "value2": "2.1",
    },
    {
      "category": "categoryA",
      "name": "keyA",
      "value": "valueA",
      "name2": "customKeyA",
      "value2": "valueKeyA",
    },
    {
      "category": "categoryB",
      "name": "keyB",
      "value": "valueB",
      "name2": "customKeyB",
      "value2": "valueKeyB",
    },
    {
      "category": "categoryC",
      "name": "keyC",
      "value": "valueC",
      "name2": "customKeyC",
      "value2": "valueKeyC",
    },
  ];

  return (
    <PageContainer title={formatMessage({ id: 'page.info.pageContainer.title' })}>
      <Select
        showSearch
        style={{ backgroundColor: "#fff", width: "100%", textAlign: "right", padding: "16px 24px", marginBottom: "15px" }}
        onChange={(value) => { console.log(value) }}
      >
        {mydata.map(item => (
          <Option value={item.category}>
            {item.category}
          </Option>
        ))};
      </Select>
      <div className="InfoWrap">
        {mydata.map((item) => {
          return (
            <table className="InfoTable">
              <thead>
                <th>{item.category && <span>{item.category}</span>}</th>
                <th>&nbsp;</th>
              </thead>
              <tbody>
                <tr>
                  <td>{item.name && <span>{item.name}</span>}</td>
                  <td style={{ textAlign: "right" }}>{item.value && <span>{item.value}</span>}</td>
                </tr>
                <tr>
                  <td>{item.name2 && <span>{item.name2}</span>}</td>
                  <td style={{ textAlign: "right" }}>{item.value2 && <span>{item.value2}</span>}</td>
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
