<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# apisix_dashboard

## Overview

Dashboard for APISIX & based on ElementUI.

## Documentation

[Docs](https://armour.github.io/vue-typescript-admin-docs)

[Vue Config Docs](https://cli.vuejs.org/zh/config/#publicpath)

## Project Structure

```bash
├── public                     # public static assets
│   │── img/                   # static image files
│   │── favicon.ico            # favicon
│   │── index.html             # index.html template
│   └── robots.txt             # robots file
├── src                        # main source code
│   ├── api/                   # api service
│   ├── components/            # global components
│   ├── lang/                  # i18n language
│   ├── layout/                # global layout
│   ├── router/                # router
│   ├── store/                 # store
│   ├── styles/                # global css
│   ├── utils/                 # global utils
│   ├── views/                 # views
│   ├── App.vue                # main app component
│   ├── main.ts                # app entry file
│   ├── permission.ts          # permission authentication
│   ├── settings.ts            # setting file
│   └── shims.d.ts             # type definition shims
├── licenses                   # license files for ALv2 and boilerplate
├── .browserslistrc            # browserslist config file (to support Autoprefixer)
├── .editorconfig              # editor code format consistency config
├── .env.xxx                   # env variable configuration
├── .eslintrc.js               # eslint config
├── .eslintignore              # eslint ignore config
├── .gitignore                 # git ignore config
├── babel.config.js            # babel config
├── LICENSE                    # license file
├── NOTICE                     # notice file
├── package.json               # package.json
├── postcss.config.js          # postcss config
├── README.md                  # some information about APISIX
├── tsconfig.json              # typescript config
├── vue.config.js              # vue-cli config
└── yarn.lock                  # keep exact versions of each dependency
```

## Project setup
> Make sure Node.js 8.12.0 or higher, and Yarn are installed on your machine: https://yarnpkg.com/en/docs/install

### Install dependencies

```bash
yarn install
```

### Compiles and hot-reloads for development

```bash
yarn run serve
```

### Compiles and minifies for production

```bash
yarn run build:prod
```

### Lints and fixes files

```bash
yarn run lint
```

### Customize Vue configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions
