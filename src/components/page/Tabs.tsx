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
import {
  Tabs as MTabs,
  type TabsListProps,
  type TabsProps as MTabsProps,
} from '@mantine/core';

export type TabsItem = {
  value: string;
  label: string;
  content?: React.ReactNode;
};
export type TabsProps = {
  defaultValue?: string;
  items: TabsItem[];
  listProps?: TabsListProps;
} & MTabsProps;

export const Tabs = (props: TabsProps) => {
  const { defaultValue, items, listProps, ...rest } = props;
  return (
    <MTabs
      defaultValue={defaultValue || items[0].value}
      keepMounted={false}
      {...rest}
    >
      <MTabs.List {...listProps}>
        {items.map((item) => (
          <MTabs.Tab key={item.value} value={item.value}>
            {item.label}
          </MTabs.Tab>
        ))}
      </MTabs.List>
      {items.map(
        (item) =>
          item.content && (
            <MTabs.Panel key={item.value} value={item.value}>
              {item.content}
            </MTabs.Panel>
          )
      )}
    </MTabs>
  );
};
