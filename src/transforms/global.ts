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
type ActionType = 'get' | 'set' | 'delete' | 'create';

interface Node<T> {
  createdIndex: number;
  key: string;
  modifiedIndex: number;
  value: T;
}

export interface ListItem<T> extends Node<T> {
  displayKey: string;
  id?: number;
}

/**
 * Transform data from fetch target item.
 */
export const transformFetchItemData = <T>(data: { node: Node<T>; action: ActionType }) => {
  const result = data.node.key.match(/\/([0-9]+)/);
  if (result) {
    const [, key] = result;
    /* eslint no-param-reassign: ["error", { "props": false }] */
    data.node.key = key;
  }
  return data.node;
};
