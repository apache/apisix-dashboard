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
import { useCallback, useState } from 'react';

export default function useRequest<T, Y extends any[]>(requestFn: any) {
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<T>();

  const [err, setErr] = useState();

  const fn = useCallback(async (...params: Y) => {
    setLoading(true);
    let res;
    try {
      res = await requestFn(...params);
      setData(res);
    } catch (error) {
      // @ts-ignore
      setErr(error);
    }
    setLoading(false);
    return res;
  }, []);

  return {
    fn,
    data,
    err,
    loading,
  };
}
