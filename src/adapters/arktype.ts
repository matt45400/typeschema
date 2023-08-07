import type {Resolver} from '../resolver';
import type {Adapter} from '.';
import type {Type} from 'arktype';

import {isJSONSchema, isTypeBoxSchema, maybeImport} from '../utils';
import {ValidationIssue} from '../validation';

interface ArkTypeResolver extends Resolver {
  base: Type<this['type']>;
  input: this['schema'] extends Type ? this['schema']['inferIn'] : never;
  output: this['schema'] extends Type ? this['schema']['infer'] : never;
  module: typeof import('arktype');
}

declare global {
  export interface TypeSchemaRegistry {
    arktype: ArkTypeResolver;
  }
}

export const init: Adapter<'arktype'>['init'] = async () =>
  maybeImport<typeof import('arktype')>('arktype');

export const coerce: Adapter<'arktype'>['coerce'] = schema =>
  'infer' in schema && !isTypeBoxSchema(schema) && !isJSONSchema(schema)
    ? schema
    : null;

export const createValidate: Adapter<'arktype'>['createValidate'] =
  schema => async data => {
    const result = schema(data);
    if (result.problems == null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {data: result.data as any};
    }
    return {
      issues: Array.from(result.problems).map(
        ({message, path}) => new ValidationIssue(message, path),
      ),
    };
  };
