// @flow

type TypeExpression = {
  toString: () => string
};

const SimpleType = (type: string): TypeExpression => ({ toString: () => type });
const UnionType = (
  left: TypeExpression,
  right: TypeExpression
): TypeExpression => ({
  toString: () => `${left.toString()} & ${right.toString()}`
});
const ArrayType = (itemType: TypeExpression): TypeExpression => ({
  toString: () => `Array<${itemType.toString()}>`
});
const EnumType = (...constants: Array<TypeExpression>): TypeExpression => ({
  toString: () => constants.map(constant => constant.toString()).join(' | ')
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
  toString: () => `${constant}`
});

const hasKeys = objOrUndefined =>
  typeof objOrUndefined === 'object' && Object.keys(objOrUndefined).length > 0;
const contains = (value, arrayOrUndefined) =>
  Array.isArray(arrayOrUndefined) && arrayOrUndefined.includes(value);

export const generateTypes = (jsonSchema: Object): { [string]: string } => {
  const RootType = parseNode(jsonSchema);

  const types = { RootType: RootType.toString() };
  for(const typeName in jsonSchema.definitions) {
    types[typeName] = parseNode(jsonSchema.definitions[typeName]).toString();
  }

  return types;
};

const DEFINITIONS_REF = /^#\/definitions\/(\w+)$/;
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
    !hasKeys(node.required) &&
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
  return SimpleType(node.type);
};

const parseArray = (node: Object): TypeExpression => {
  return ArrayType(parseNode(node.items));
};

const parseNode = (node: Object): TypeExpression => {
  if (typeof node.$ref === 'string') return resolveRef(node);

  if (node.type != null) {
    if (node.type === 'string' || node.type === 'enum')
      return parsePrimitive(node);
    if (node.type === 'object') return parseObject(node);
    if (node.type === 'array') return parseArray(node);
  }
  throw new Error('Cannot handle ' + JSON.stringify(node));
};

const typeToString = type => {
  if (typeof type === 'string') return string;
};
