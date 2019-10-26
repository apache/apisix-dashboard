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

import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

interface IErrorLog {
  err: Error
  vm: any
  info: string
  url: string
}

export interface IErrorLogState {
  logs: IErrorLog[]
}

@Module({ dynamic: true, store, name: 'errorLog' })
class ErrorLog extends VuexModule implements IErrorLogState {
  public logs: IErrorLog[] = []

  @Mutation
  private ADD_ERROR_LOG(log: IErrorLog) {
    this.logs.push(log)
  }

  @Mutation
  private CLEAR_ERROR_LOG() {
    this.logs.splice(0)
  }

  @Action
  public AddErrorLog(log: IErrorLog) {
    this.ADD_ERROR_LOG(log)
  }

  @Action
  public ClearErrorLog() {
    this.CLEAR_ERROR_LOG()
  }
}

export const ErrorLogModule = getModule(ErrorLog)
