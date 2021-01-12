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
import moment from 'moment';

import { fetchInfoList } from './service';
import styles from './style.less';

const ServerInfo: React.FC = () => {
  const [data, setData] = useState<ServerInfoModule.Node>();
  const [nodeList, setNodeList] = useState<ServerInfoModule.Node[]>([]);
  const { formatMessage } = useIntl();
  const { Option } = Select;

  const [form] = Form.useForm();

  useEffect(() => {
    fetchInfoList().then((infoList) => {
      const list = infoList.map(item => {
        return {
          ...item,
          boot_time: moment(item.boot_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
          last_report_time: moment(item.last_report_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
          up_time: moment(item.boot_time * 1000).fromNow(true),
        }
      });

      setNodeList(list);
      if (list.length) {
        form.setFieldsValue({
          nodeId: list[0].id,
        });

        setData(list[0]);
      }
    });
  }, []);

  return (
    <PageContainer title={formatMessage({ id: 'page.serverinfo.pageContainer.title' })}>
      <div className={styles.select}>
        <Form form={form}>
          <Form.Item wrapperCol={{ span: 5 }} style={{ marginBottom: 0 }} name="nodeId">
            <Select
              placeholder={formatMessage({ id: 'page.serverinfo.select.placeholder' })}
              onChange={(value) => {
                setData(
                  nodeList.find((item) => {
                    return item.id === value;
                  }),
                );
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
          <Form.Item style={{ marginBottom: 0, fontSize: '12px', color: '#00000073' }}>
            {formatMessage({ id: 'page.serverinfo.desc' })}&nbsp;
            <a
              href="https://github.com/apache/apisix/blob/master/doc/plugins/server-info.md"
              target="_blank"
              rel="noreferrer"
            >
              {formatMessage({ id: 'page.serverinfo.link' })}
            </a>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.wrap}>
        {nodeList.length === 0 && <Empty />}
        {nodeList.length > 0 && (
          <table className={styles.table}>
            <tbody>
              {Object.entries(data || {}).map((item) => (
                <tr>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
};

export default ServerInfo;
