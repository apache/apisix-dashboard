import { createContext, useContext } from 'react';

const NamePrefixContext = createContext<string>('');

export const useNamePrefix = () => {
  const prefix = useContext(NamePrefixContext) || '';
  return <T extends string>(name: T) =>
    (prefix ? [prefix, name].join('.') : name) as `${T}`;
};

export const NamePrefixProvider = NamePrefixContext.Provider;
