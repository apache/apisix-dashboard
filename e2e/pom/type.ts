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

import { type Locator, type Page } from '@playwright/test';

export type POMLocator = {
  getAddBtn: (page: Page) => Locator;
};

export type POMAssert = {
  isIndexPage: (page: Page) => Promise<void>;
  isAddPage: (page: Page) => Promise<void>;
  isDetailPage: (page: Page) => Promise<void>;
};

export type POMGoto = {
  toIndex: (page: Page) => void;
  toAdd: (page: Page) => void;
};

export type CommonPOM = POMLocator & POMAssert & POMGoto;
