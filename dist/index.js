'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var prettier = _interopDefault(require('prettier'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SimpleType = function SimpleType(type) {
  return { toString: function toString() {
      return type;
    } };
};

var UnionType = function UnionType() {
  for (var _len = arguments.length, elements = Array(_len), _key = 0; _key < _len; _key++) {
    elements[_key] = arguments[_key];
  }

  return {
    toString: function toString() {
      return elements.length === 1 ? elements[0].toString() : '(' + elements.map(function (element) {
        return element.toString();
      }).join(' & ') + ')';
    }
  };
};
var EnumType = function EnumType() {
  for (var _len2 = arguments.length, elements = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    elements[_key2] = arguments[_key2];
  }

  return {
    toString: function toString() {
      return elements.length === 1 ? elements[0].toString() : '(' + elements.map(function (element) {
        return element.toString();
      }).join(' | ') + ')';
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

  var types = { RootType: RootType };
  for (var typeName in jsonSchema.definitions) {
    types[typeName] = parseNode(jsonSchema.definitions[typeName]);
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
  if (!hasKeys(node.properties) && !Array.isArray(node.required) && node.additionalProperties !== false) return SimpleType('Object');

  var complexType = {};
  for (var key in node.properties) {
    var resolvedPropType = parseNode(node.properties[key]);
    if (contains(key, node.required)) {
      complexType[key] = resolvedPropType;
    } else {
      complexType[key + '?'] = resolvedPropType;
    }
  }

  if (Array.isArray(node.required)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = node.required[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _key3 = _step.value;

        if (!complexType.hasOwnProperty(_key3)) {
          complexType[_key3] = SimpleType('any');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
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
  if (node.type === 'integer') return SimpleType('number');
  if (typeof node.format === 'string') return SimpleType('string');

  return SimpleType(node.type);
};

var parseArray = function parseArray(node) {
  return ArrayType(parseNode(node.items));
};

var parseNode = function parseNode(node) {
  if (typeof node.$ref === 'string') return resolveRef(node);
  if (Array.isArray(node.allOf) || Array.isArray(node.anyOf) || Array.isArray(node.oneOf)) {
    var baseNode = Object.assign({}, node);
    delete baseNode.allOf;
    delete baseNode.anyOf;
    delete baseNode.oneOf;
    var baseType = parseNode(baseNode);

    var withAllOf = Array.isArray(node.allOf) ? UnionType.apply(undefined, [baseType].concat(_toConsumableArray(node.allOf.map(parseNode)))) : baseType;
    var withAnyOf = Array.isArray(node.anyOf) ? UnionType(withAllOf, EnumType.apply(undefined, _toConsumableArray(node.anyOf.map(parseNode)))) : withAllOf;
    var withOneOf = Array.isArray(node.oneOf) ? UnionType(withAnyOf, EnumType.apply(undefined, _toConsumableArray(node.oneOf.map(parseNode)))) : withAnyOf;

    return withOneOf;
  }

  if (node.type === 'object' || hasKeys(node.properties) || Array.isArray(node.required)) return parseObject(node);

  if (node.type === 'string' || node.type === 'boolean' || node.type === 'integer' || typeof node.format === 'string' || Array.isArray(node.enum) || node.type === 'number') return parsePrimitive(node);
  if (node.type === 'array') return parseArray(node);

  if (Array.isArray(node.enum)) return parsePrimitive(node);
  return parseObject(node);
};

var formatTypeExpression = function formatTypeExpression(type) {
  return type.toString();
};

var formatTypes = function formatTypes(types) {
  var pretty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var result = Object.keys(types).map(function (type) {
    return 'export type ' + type + ' = ' + formatTypeExpression(types[type]);
  }).join('\n');

  if (pretty) {
    return prettier.format(result, { parser: 'flow' });
  } else {
    return result;
  }
};

exports.generateTypes = generateTypes;
exports.formatTypeExpression = formatTypeExpression;
exports.formatTypes = formatTypes;
