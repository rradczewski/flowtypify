var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SimpleType = function SimpleType(type) {
  return { toString: function toString() {
      return type;
    } };
};

var UnionType = function UnionType(left, right) {
  return {
    toString: function toString() {
      return left.toString() + ' & ' + right.toString();
    }
  };
};
var ArrayType = function ArrayType(itemType) {
  return {
    toString: function toString() {
      return 'Array<' + itemType.toString() + '>';
    }
  };
};
var EnumType = function EnumType() {
  for (var _len = arguments.length, constants = Array(_len), _key = 0; _key < _len; _key++) {
    constants[_key] = arguments[_key];
  }

  return {
    toString: function toString() {
      return constants.map(function (constant) {
        return constant.toString();
      }).join(' | ');
    }
  };
};
var ComplexType = function ComplexType(type) {
  return {
    toString: function toString() {
      return '{ ' + Object.keys(type).map(function (key) {
        return key + ': ' + type[key].toString();
      }).join(', ') + ' }';
    }
  };
};
var StringConstant = function StringConstant(constant) {
  return {
    toString: function toString() {
      return '"' + constant + '"';
    }
  };
};
var NumericConstant = function NumericConstant(constant) {
  return {
    toString: function toString() {
      return String(constant);
    }
  };
};

var hasKeys = function hasKeys(objOrUndefined) {
  return (typeof objOrUndefined === 'undefined' ? 'undefined' : _typeof(objOrUndefined)) === 'object' && Object.keys(objOrUndefined).length > 0;
};
var contains = function contains(value, arrayOrUndefined) {
  return Array.isArray(arrayOrUndefined) && arrayOrUndefined.includes(value);
};

var generateTypes = function generateTypes(jsonSchema) {
  var RootType = parseNode(jsonSchema);

  var types = { RootType: RootType.toString() };
  for (var typeName in jsonSchema.definitions) {
    types[typeName] = parseNode(jsonSchema.definitions[typeName]).toString();
  }

  return types;
};

var DEFINITIONS_REF = /^#\/definitions\/([^\/]+)$/;
var resolveRef = function resolveRef(node) {
  if (node.$ref === '#/') return SimpleType('RootType');
  var definition = DEFINITIONS_REF.exec(node.$ref);
  if (definition != null && definition[1] != null) return SimpleType(definition[1]);

  throw new Error('Can not resolve ref ' + node.$ref);
};

var parseObject = function parseObject(node) {
  if (!hasKeys(node.properties) && !hasKeys(node.required) && node.additionalProperties !== false) return SimpleType('Object');

  var complexType = {};
  for (var key in node.properties) {
    var resolvedPropType = parseNode(node.properties[key]);
    if (contains(key, node.required)) {
      complexType[key] = resolvedPropType;
    } else {
      complexType[key + '?'] = resolvedPropType;
    }
  }

  var type = ComplexType(complexType);
  if (node.additionalProperties === false) {
    return type;
  } else {
    return UnionType(type, SimpleType('Object'));
  }
};

var parsePrimitive = function parsePrimitive(node) {
  if (Array.isArray(node.enum) && node.enum.length > 0) {
    return EnumType.apply(undefined, _toConsumableArray(node.enum.map(function (enumVal) {
      return typeof enumVal === 'string' ? StringConstant(enumVal) : NumericConstant(enumVal);
    })));
  }
  return SimpleType(node.type);
};

var parseArray = function parseArray(node) {
  return ArrayType(parseNode(node.items));
};

var parseNode = function parseNode(node) {
  if (typeof node.$ref === 'string') return resolveRef(node);

  if (node.type != null) {
    if (node.type === 'string' || node.enum === 'enum' || node.type === 'number') return parsePrimitive(node);
    if (node.type === 'object') return parseObject(node);
    if (node.type === 'array') return parseArray(node);
  }

  if (Array.isArray(node.enum)) return parsePrimitive(node);
  throw new Error('Cannot handle ' + JSON.stringify(node));
};

export { generateTypes };
