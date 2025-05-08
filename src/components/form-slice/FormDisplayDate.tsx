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
import { InputWrapper, type InputWrapperProps,Text } from '@mantine/core';
import dayjs from 'dayjs';

type FormDisplayDateProps = InputWrapperProps & {
  date: dayjs.ConfigType;
};
const format = 'YYYY-MM-DD HH:mm:ss';
export const FormDisplayDate = (props: FormDisplayDateProps) => {
  const { date, ...rest } = props;
  const d = typeof date === 'number' ? date * 1000 : date;
  return (
    <InputWrapper {...rest}>
      <Text size="sm" c="gray.6">
        {d ? dayjs(d).format(format) : '-'}
      </Text>
    </InputWrapper>
  );
};
