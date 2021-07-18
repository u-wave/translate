export interface LocaleKeys {
  [name: string]: string | LocaleKeys;
}

export type Pluralizer = (n: number) => string;

export interface Options {
  plural: Pluralizer;
  default?: null | Translator;
}

export type EmbedValue = any;
export interface PartsData {
  count?: number;
  [key: string]: EmbedValue;
}
export interface PartsOptions {
  throw?: boolean;
}

export default class Translator {
  constructor(strings: LocaleKeys, options?: Partial<Options>);
  parts(key: string | string[], data?: PartsData, options?: PartsOptions): EmbedValue[] | undefined;
  t(key: string | string[], data?: PartsData): string | undefined;
}
