// @flow
type TypeExpression = {
  toString: () => string
};

const SimpleType = (type: string): TypeExpression => ({ toString: () => type });
const UnionType = (...elements): TypeExpression => ({
  toString: () =>
    elements.length === 1
      ? elements[0].toString()
      : `(${elements.map(element => element.toString()).join(' & ')})`
});
const EnumType = (...elements: Array<TypeExpression>): TypeExpression => ({
  toString: () =>
    elements.length === 1
      ? elements[0].toString()
      : `(${elements.map(element => element.toString()).join(' | ')})`
});
const ArrayType = (itemType: TypeExpression): TypeExpression => ({
  toString: () => `Array<${itemType.toString()}>`
});
const OptionalType = (type: TypeExpression): TypeExpression => ({
  toString: () => `?${type.toString()}`
});
const ComplexType = (type: { [string]: TypeExpression }): TypeExpression => ({
  toString: () =>
    `{ ${Object.keys(type)
      .map(key => `${key}: ${type[key].toString()}`)
      .join(', ')} }`
});
const StringConstant = (constant: string): TypeExpression => ({
  toString: () => `"${constant}"`
});
const NumericConstant = (constant: Number): TypeExpression => ({
  toString: () => String(constant)
});

const hasKeys = objOrUndefined =>
  typeof objOrUndefined === 'object' && Object.keys(objOrUndefined).length > 0;
const contains = (value, arrayOrUndefined) =>
  Array.isArray(arrayOrUndefined) && arrayOrUndefined.includes(value);

export const generateTypes = (jsonSchema: Object): { [string]: string } => {
  const RootType = parseNode(jsonSchema);

  const types = { RootType: RootType.toString() };
  for (const typeName in jsonSchema.definitions) {
    types[typeName] = parseNode(jsonSchema.definitions[typeName]).toString();
  }

  return types;
};

const DEFINITIONS_REF = /^#\/definitions\/([^\/]+)$/;
const resolveRef = (node: Object): TypeExpression => {
  if (node.$ref === '#/') return SimpleType('RootType');
  const definition = DEFINITIONS_REF.exec(node.$ref);
  if (definition != null && definition[1] != null)
    return SimpleType(definition[1]);

  throw new Error('Can not resolve ref ' + node.$ref);
};

const parseObject = (node: Object): TypeExpression => {
  if (
    !hasKeys(node.properties) &&
    !Array.isArray(node.required) &&
    node.additionalProperties !== false
  )
    return SimpleType('Object');

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
        complexType[key] = SimpleType('any');
      }
    }
  }

  const type = ComplexType(complexType);
  if (node.additionalProperties === false) {
    return type;
  } else {
    return UnionType(type, SimpleType('Object'));
  }
};

const parsePrimitive = (node: Object): TypeExpression => {
  if (Array.isArray(node.enum) && node.enum.length > 0) {
    return EnumType(
      ...node.enum.map(
        enumVal =>
          typeof enumVal === 'string'
            ? StringConstant(enumVal)
            : NumericConstant(enumVal)
      )
    );
  }
  if (node.type === 'integer') return SimpleType('number');
  if (typeof node.format === 'string') return SimpleType('string');

  return SimpleType(node.type);
};

const parseArray = (node: Object): TypeExpression => {
  return ArrayType(parseNode(node.items));
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
      ? UnionType(baseType, ...node.allOf.map(parseNode))
      : baseType;
    const withAnyOf = Array.isArray(node.anyOf)
      ? UnionType(withAllOf, EnumType(...node.anyOf.map(parseNode)))
      : withAllOf;
    const withOneOf = Array.isArray(node.oneOf)
      ? UnionType(withAnyOf, EnumType(...node.oneOf.map(parseNode)))
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
