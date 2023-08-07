import type {Infer, InferIn} from '..';

import {beforeEach, describe, expect, test} from '@jest/globals';
import {expectTypeOf} from 'expect-type';
import {Number, Record, String} from 'runtypes';

import {assert, createAssert, validate} from '..';
import {resetAdapters} from '../adapters';
import {extractIssues} from './utils';

describe('runtypes', () => {
  beforeEach(() => resetAdapters());

  const schema = Record({
    age: Number,
    createdAt: String,
    email: String,
    id: String,
    name: String,
    updatedAt: String,
  });

  const data = {
    age: 123,
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };
  const badData = {
    age: '123',
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf(data);
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf(data);
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({data});
    expect(extractIssues(await validate(schema, badData))).toStrictEqual([
      {
        message: `Validation failed:
{
  "age": "Expected number, but was string"
}.
Object should match { age: number; createdAt: string; email: string; id: string; name: string; updatedAt: string; }`,
      },
    ]);
  });

  test('assert', async () => {
    expect(await assert(schema, data)).toStrictEqual(data);
    await expect(assert(schema, badData)).rejects.toThrow();
  });

  test('createAssert', async () => {
    const assertSchema = createAssert(schema);
    expect(await assertSchema(data)).toEqual(data);
    await expect(assertSchema(badData)).rejects.toThrow();
  });
});
