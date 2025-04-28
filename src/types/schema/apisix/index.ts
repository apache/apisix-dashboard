import { A6Common } from './common';
import { A6Plugin } from './plugin';
import { A6GlobalRule } from './global-rule';
import { A6Proto } from './proto';
import { A6Route } from './route';
import { A6Upstream } from './upstream';
export type { A6Type } from './type';
export const A6 = {
  ...A6Common,
  ...A6Upstream,
  ...A6Route,
  ...A6Proto,
  ...A6GlobalRule,
  ...A6Plugin,
};
