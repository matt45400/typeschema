import type {Resolver} from '../resolver';
import type {Adapter} from '.';

import {ValidationIssue} from '../validation';

type FunctionSchema<T = unknown> = (data: unknown) => Promise<T> | T;

interface FunctionResolver extends Resolver {
  base: FunctionSchema<this['type']>;
  input: this['schema'] extends FunctionSchema
    ? keyof this['schema'] extends never
      ? Awaited<ReturnType<this['schema']>>
      : never
    : never;
  output: this['schema'] extends FunctionSchema
    ? keyof this['schema'] extends never
      ? Awaited<ReturnType<this['schema']>>
      : never
    : never;
  module: Record<string, never>;
}

declare global {
  export interface TypeSchemaRegistry {
    function: FunctionResolver;
  }
}

export const init: Adapter<'function'>['init'] = async () => ({});

export const coerce: Adapter<'function'>['coerce'] = schema =>
  typeof schema === 'function' && !('assert' in schema) ? schema : null;

export const createValidate: Adapter<'function'>['createValidate'] =
  schema => async data => {
    try {
      return {data: await schema(data)};
    } catch (error) {
      if (error instanceof Error) {
        return {issues: [new ValidationIssue(error.message)]};
      }
      throw error;
    }
  };
