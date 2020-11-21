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
import { Result, Button } from 'antd';
import { history, useIntl } from 'umi';

type Props = {
  createNew(): void;
};

const ResultView: React.FC<Props> = (props) => {
  const { formatMessage } = useIntl();
  return (
    <Result
      status="success"
      title={`${formatMessage({ id: 'component.global.submit' })}${formatMessage({
        id: 'component.status.success',
      })}`}
      extra={[
        <Button type="primary" key="goto-list" onClick={() => history.replace('/routes/list')}>
          {formatMessage({ id: 'page.route.button.returnList' })}
        </Button>,
        <Button key="create-new" onClick={() => props.createNew()}>
          {`${formatMessage({ id: 'component.global.create' })} ${formatMessage({
            id: 'menu.routes',
          })}`}
        </Button>,
      ]}
    />
  );
};

export default ResultView;
