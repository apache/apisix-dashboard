import { action, observable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';

/** allow store use `set(key, value)` */
const set = action(function <T, K extends keyof T>(
  this: T,
  key: K extends `set` ? never : K,
  value: T[K]
) {
  this[key as K] = value;
});

const settingsStore = observable({
  set,
  isOpen: false,
  adminKey: '',
});

export const globalStore = observable({
  settings: settingsStore,
});

makePersistable(settingsStore, {
  name: 'settings',
  properties: ['adminKey'],
  storage: window.localStorage,
});
