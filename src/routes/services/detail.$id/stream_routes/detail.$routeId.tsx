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
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';

import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { StreamRouteDetail } from '@/routes/stream_routes/detail.$id';
import { CommonFormContext } from '@/utils/form-context';

function RouteComponent() {
  const { id, routeId } = useParams({
    from: '/services/detail/$id/stream_routes/detail/$routeId',
  });
  const navigate = useNavigate();
  return (
    <CommonFormContext.Provider value={{ readOnlyFields: ['service_id'] }}>
      <StreamRouteDetail
        id={routeId}
        onDeleteSuccess={() =>
          navigate({
            to: '/services/detail/$id/stream_routes',
            params: { id },
          })
        }
      />
    </CommonFormContext.Provider>
  );
}

export const Route = createFileRoute(
  '/services/detail/$id/stream_routes/detail/$routeId'
)({
  component: RouteComponent,
  errorComponent: StreamRoutesErrorComponent,
});
