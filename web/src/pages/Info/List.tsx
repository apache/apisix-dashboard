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
import { Select, Empty, Form } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useIntl } from 'umi';

import { fetchInfoList } from './service';
import styles from './Info.less';

const Info: React.FC = () => {
  const [data, setData] = useState<NodeDetail[]>([]);
  const [nodeList, setNodeList] = useState<NodeListData[]>([]);
  const { formatMessage } = useIntl();
  const { Option } = Select;

  useEffect(() => {
    fetchInfoList().then(setNodeList);
  }, []);

  return (
    <PageContainer title={formatMessage({ id: 'page.info.pageContainer.title' })}>
      <div className={styles.select}>
        <Form>
          <Form.Item label="Node:" wrapperCol={{ span: 3 }}>
            <Select
              placeholder="Please select node"
              onChange={(value) => {
                const arr = nodeList.filter((item) => {
                  return item.id === value;
                });
                setData(arr);
              }}
            >
              {nodeList.map((item) => (
                <Option key={item.hostname} value={item.id}>
                  {item.hostname}
                </Option>
              ))}
              ;
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.wrap}>
        {data.length === 0 && <Empty />}
        {data.length > 0 && (
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
        )}
      </div>
    </PageContainer>
  );
};

export default Info;
