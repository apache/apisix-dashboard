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

import { parseTime } from '@/utils/index.ts'

describe('Utils:parseTime', () => {
  const d = +new Date('2018-07-13 17:54:01') // "2018-07-13 17:54:01"
  it('timestamp', () => {
    expect(parseTime(d)).toBe('2018-07-13 17:54:01')
  })
  it('ten digits timestamp', () => {
    expect(parseTime((d / 1000).toFixed(0))).toBe('2018-07-13 17:54:01')
  })
  it('new Date', () => {
    expect(parseTime(new Date(d))).toBe('2018-07-13 17:54:01')
  })
  it('format', () => {
    expect(parseTime(d, '{y}-{m}-{d} {h}:{i}')).toBe('2018-07-13 17:54')
    expect(parseTime(d, '{y}-{m}-{d}')).toBe('2018-07-13')
    expect(parseTime(d, '{y}/{m}/{d} {h}-{i}')).toBe('2018/07/13 17-54')
  })
  it('get the day of the week', () => {
    expect(parseTime(d, '{a}')).toBe('五') // 星期五
  })
  it('get the day of the week', () => {
    expect(parseTime(+d + 1000 * 60 * 60 * 24 * 2, '{a}')).toBe('日') // 星期日
  })
  it('empty argument', () => {
    expect(parseTime()).toBeNull()
  })
})
