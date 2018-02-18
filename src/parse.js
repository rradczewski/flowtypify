// @flow
import UpperCamelCase from 'uppercamelcase';

import type { TypeExpression } from './types';
import {
  SimpleType,
  UnionType,
  EnumType,
  ArrayType,
  OptionalType,
  UnsealedObjectType,
  ObjectType,
  ConstantType
} from './types';

const hasKeys = objOrUndefined =>
  typeof objOrUndefined === 'object' && Object.keys(objOrUndefined).length > 0;
const contains = (value, arrayOrUndefined) =>
  Array.isArray(arrayOrUndefined) && arrayOrUndefined.includes(value);

export const generateTypes = (
  jsonSchema: Object
): { [string]: TypeExpression } => {
  const RootType = parseNode(jsonSchema);

  const types = { RootType };
  for (const typeName in jsonSchema.definitions) {
    types[UpperCamelCase(typeName)] = parseNode(jsonSchema.definitions[typeName]);
  }

  return types;
};

const DEFINITIONS_REF = /^#\/definitions\/([^\/]+)$/;
const resolveRef = (node: Object): TypeExpression => {
  if (node.$ref === '#/') return new SimpleType('RootType');
  const definition = DEFINITIONS_REF.exec(node.$ref);
  if (definition != null && definition[1] != null)
    return new SimpleType(UpperCamelCase(definition[1]));

  throw new Error('Can not resolve ref ' + node.$ref);
};

const parseObject = (node: Object): TypeExpression => {
  if (
    !hasKeys(node.properties) &&
    !Array.isArray(node.required) &&
    node.additionalProperties !== false
  )
    return new SimpleType('Object');

  const complexType = {};
  for (const key in node.properties) {
    const resolvedPropType = parseNode(node.properties[key]);
    if (contains(key, node.required)) {
      complexType[key] = resolvedPropType;
    } else {
      complexType[key + '?'] = resolvedPropType;
    }
  }

  if (Array.isArray(node.required)) {
    for (const key of node.required) {
      if (!complexType.hasOwnProperty(key)) {
        complexType[key] = new SimpleType('any');
      }
    }
  }

  const type = new ObjectType(complexType);
  if (node.additionalProperties === false) {
    return type;
  } else {
    return new UnsealedObjectType(type);
  }
};

const parsePrimitive = (node: Object): TypeExpression => {
  if (Array.isArray(node.enum) && node.enum.length > 0) {
    return new EnumType(...node.enum.map(enumVal => new ConstantType(enumVal)));
  }
  if (node.type === 'integer') return new SimpleType('number');
  if (typeof node.format === 'string') return new SimpleType('string');

  return new SimpleType(node.type);
};

const parseArray = (node: Object): TypeExpression => {
  if (node.items == null) {
    return new ArrayType(new SimpleType('any'));
  }
  return new ArrayType(parseNode(node.items));
};

const parseNode = (node: Object): TypeExpression => {
  if (typeof node.$ref === 'string') return resolveRef(node);
  if (
    Array.isArray(node.allOf) ||
    Array.isArray(node.anyOf) ||
    Array.isArray(node.oneOf)
  ) {
    const baseNode = Object.assign({}, node);
    delete baseNode.allOf;
    delete baseNode.anyOf;
    delete baseNode.oneOf;
    const baseType = parseNode(baseNode);

    const withAllOf = Array.isArray(node.allOf)
      ? new UnionType(baseType, ...node.allOf.map(parseNode))
      : baseType;
    const withAnyOf = Array.isArray(node.anyOf)
      ? new UnionType(withAllOf, new EnumType(...node.anyOf.map(parseNode)))
      : withAllOf;
    const withOneOf = Array.isArray(node.oneOf)
      ? new UnionType(withAnyOf, new EnumType(...node.oneOf.map(parseNode)))
      : withAnyOf;

    return withOneOf;
  }

  if (
    node.type === 'object' ||
    hasKeys(node.properties) ||
    Array.isArray(node.required)
  )
    return parseObject(node);

  if (
    node.type === 'string' ||
    node.type === 'boolean' ||
    node.type === 'integer' ||
    typeof node.format === 'string' ||
    Array.isArray(node.enum) ||
    node.type === 'number'
  )
    return parsePrimitive(node);
  if (node.type === 'array') return parseArray(node);

  if (Array.isArray(node.enum)) return parsePrimitive(node);
  return parseObject(node);
};
