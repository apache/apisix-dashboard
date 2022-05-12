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
import { ActionBarEnUS } from '@/components/ActionBar';

import component from './tr-TR/component';
import globalHeader from './tr-TR/globalHeader';
import menu from './tr-TR/menu';
import pwa from './tr-TR/pwa';
import settingDrawer from './tr-TR/settingDrawer';
import settings from './tr-TR/setting';
import other from './tr-TR/other';
import Plugin from '../components/Plugin/locales/tr-TR';
import PluginFlow from '../components/PluginFlow/locales/tr-TR';
import RawDataEditor from '../components/RawDataEditor/locales/tr-TR';
import UpstreamComponent from '../components/Upstream/locales/tr-TR';

export default {
  'navBar.lang': 'Dil Seçenekleri',
  'layout.user.link.help': 'Yardım',
  'layout.user.link.privacy': 'Gizlilik',
  'layout.user.link.terms': 'Kurallar',
  'app.preview.down.block': 'Sayfayı yerel projenize indirin',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...other,
  ...ActionBarEnUS,
  ...Plugin,
  ...PluginFlow,
  ...RawDataEditor,
  ...UpstreamComponent,
};
