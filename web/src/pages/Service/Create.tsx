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

import React, { useState } from 'react'
import { useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

import ActionBar from '@/components/ActionBar';
import { Card, Steps } from 'antd';
import Step1 from "./components/Step1";
import styles from './Create.less';

const { Step } = Steps;
const Page: React.FC = (props) => {
    const { formatMessage } = useIntl();

    const STEP_HEADER = [
        formatMessage({ id: 'page.service.steps.stepTitle.basicInformation' }),
        formatMessage({ id: 'page.service.steps.stepTitle.pluginConfig' }),
        formatMessage({ id: 'component.global.steps.stepTitle.preview' }),
    ]

    const [stepHeader] = useState(STEP_HEADER);
    const [step, setStep] = useState(1);

    const onStepChange = (nextStep: number) => {
        console.log('nextStep: ', nextStep);
    }

    return (<>
        <PageHeaderWrapper
            title={`${(props as any).match.params.rid
                ? formatMessage({ id: 'component.global.edit' })
                : formatMessage({ id: 'component.global.create' })
                } ${formatMessage({ id: 'menu.service' })}`}
        >
            <Card bordered={false}>
                <Steps current={step - 1} className={styles.steps}>
                    {stepHeader.map((item) => (
                        <Step title={item} key={item} />
                    ))}
                </Steps>
                <Step1 />
            </Card>
        </PageHeaderWrapper>
        <ActionBar step={step} lastStep={3} onChange={onStepChange} withResultView />
    </>)
}

export default Page;