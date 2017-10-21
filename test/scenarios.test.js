import fs from 'fs';
import path from 'path';
import { generateTypes, formatTypeExpression } from '../src';
import { equals } from 'ramda';

const fixtures = fs
  .readdirSync(path.join(__dirname, 'scenarios'))
  .filter(name => name.endsWith('.json'))
  .map(jsonFile => ({
    name: jsonFile,
    jsonSchema: require(path.join(__dirname, 'scenarios/', jsonFile)),
    expectedOutput: require(path.join(
      __dirname,
      'scenarios/',
      path.basename(jsonFile, '.json') + '.js'
    )).default
  }));

describe('Scenarios from test/scenarios', () =>
  fixtures.forEach(fixture =>
    it(`correctly parses ${fixture.name}`, () => {
      const types = generateTypes(fixture.jsonSchema);

      if (typeof Object.entries(fixture.expectedOutput)[0][1] === 'string') {
        const typesStr = {};
        for (const type in types) {
          typesStr[type] = formatTypeExpression(types[type]);
        }

        expect(typesStr).toEqual(fixture.expectedOutput);
      } else {
        expect(equals(types, fixture.expectedOutput)).toBe(true);
      }
    })
  ));
