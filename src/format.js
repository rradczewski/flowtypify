// @flow
import prettier from 'prettier';
import type { TypeExpression } from './parse';

export const formatTypeExpression = (type: TypeExpression): string =>
  type.toString();

export const formatTypes = (
  types: { [string]: TypeExpression },
  pretty: boolean = false
): string => {
  const result = Object.keys(types)
    .map(type => `export type ${type} = ${formatTypeExpression(types[type])}`)
    .join('\n');

  if (pretty) {
    return prettier.format(result, { parser: 'flow' });
  } else {
    return result;
  }
};
