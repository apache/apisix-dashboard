import { produce } from 'immer';
import { isNotEmpty } from 'rambdax';

import type { APISIXType } from '@/types/schema/apisix';

import type { FormPartUpstreamType } from './schema';

export const produceToUpstreamForm = (upstream: APISIXType['Upstream']) =>
  produce(upstream, (d: FormPartUpstreamType) => {
    d.__checksEnabled = !!d.checks && isNotEmpty(d.checks);
    d.__checksPassiveEnabled =
      !!d.checks?.passive && isNotEmpty(d.checks.passive);
  });
