'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var yargs = _interopDefault(require('yargs'));
var prettier = _interopDefault(require('prettier'));

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleType = function () {
  function SimpleType(typeName) {
    _classCallCheck(this, SimpleType);

    this.typeName = typeName;
  }

  _createClass(SimpleType, [{
    key: 'render',
    value: function render() {
      return this.typeName;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'SimpleType(' + this.typeName + ')';
    }
  }]);

  return SimpleType;
}();

var UnionType = function () {
  function UnionType() {
    _classCallCheck(this, UnionType);

    for (var _len = arguments.length, childTypes = Array(_len), _key = 0; _key < _len; _key++) {
      childTypes[_key] = arguments[_key];
    }

    this.childTypes = childTypes;
  }

  _createClass(UnionType, [{
    key: 'render',
    value: function render() {
      return this.childTypes.length === 1 ? this.childTypes[0].render() : '(' + this.childTypes.map(function (childType) {
        return childType.render();
      }).join(' & ') + ')';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'UnionType(' + this.childTypes.map(function (childType) {
        return childType.toString();
      }).join(', ') + ')';
    }
  }]);

  return UnionType;
}();

var EnumType = function () {
  function EnumType() {
    _classCallCheck(this, EnumType);

    for (var _len2 = arguments.length, childTypes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      childTypes[_key2] = arguments[_key2];
    }

    this.childTypes = childTypes;
  }

  _createClass(EnumType, [{
    key: 'render',
    value: function render() {
      return this.childTypes.length === 1 ? this.childTypes[0].render() : '(' + this.childTypes.map(function (childType) {
        return childType.render();
      }).join(' | ') + ')';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'EnumType(' + this.childTypes.map(function (childType) {
        return childType.toString();
      }).join(', ') + ')';
    }
  }]);

  return EnumType;
}();

var ArrayType = function () {
  function ArrayType(itemType) {
    _classCallCheck(this, ArrayType);

    this.itemType = itemType;
  }

  _createClass(ArrayType, [{
    key: 'render',
    value: function render() {
      return 'Array<' + this.itemType.render() + '>';
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Array(' + this.itemType.toString() + ')';
    }
  }]);

  return ArrayType;
}();

var OptionalType = function () {
  function OptionalType(childType) {
    _classCallCheck(this, OptionalType);

    this.childType = childType;
  }

  _createClass(OptionalType, [{
    key: 'render',
    value: function render() {
      return '?' + this.childType.render();
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Optional(' + this.childType.toString() + ')';
    }
  }]);

  return OptionalType;
}();

var ObjectType = function () {
  function ObjectType(properties) {
    _classCallCheck(this, ObjectType);

    this.properties = properties;
  }

  _createClass(ObjectType, [{
    key: 'render',
    value: function render() {
      var _this = this;

      return '{ ' + Object.keys(this.properties).map(function (key) {
        return key + ': ' + _this.properties[key].render();
      }).join(', ') + ' }';
    }
  }, {
    key: 'toString',
    value: function toString() {
      var _this2 = this;

      return 'Object(' + Object.keys(this.properties).map(function (key) {
        return key + ': ' + _this2.properties[key].toString();
      }).join(', ') + ')';
    }
  }]);

  return ObjectType;
}();

var ConstantType = function () {
  function ConstantType(constant) {
    _classCallCheck(this, ConstantType);

    this.constant = constant;
  }

  _createClass(ConstantType, [{
    key: 'render',
    value: function render() {
      if (typeof this.constant === 'string') {
        return '"' + this.constant + '"';
      } else {
        return String(this.constant);
      }
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Constant(' + this.render() + ')';
    }
  }]);

  return ConstantType;
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
  if (node.$ref === '#/') return new SimpleType('RootType');
  var definition = DEFINITIONS_REF.exec(node.$ref);
  if (definition != null && definition[1] != null) return new SimpleType(definition[1]);

  throw new Error('Can not resolve ref ' + node.$ref);
};

var parseObject = function parseObject(node) {
  if (!hasKeys(node.properties) && !Array.isArray(node.required) && node.additionalProperties !== false) return new SimpleType('Object');

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
        var _key = _step.value;

        if (!complexType.hasOwnProperty(_key)) {
          complexType[_key] = new SimpleType('any');
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

  var type = new ObjectType(complexType);
  if (node.additionalProperties === false) {
    return type;
  } else {
    return new UnionType(type, new SimpleType('Object'));
  }
};

var parsePrimitive = function parsePrimitive(node) {
  if (Array.isArray(node.enum) && node.enum.length > 0) {
    return new (Function.prototype.bind.apply(EnumType, [null].concat(_toConsumableArray(node.enum.map(function (enumVal) {
      return new ConstantType(enumVal);
    })))))();
  }
  if (node.type === 'integer') return new SimpleType('number');
  if (typeof node.format === 'string') return new SimpleType('string');

  return new SimpleType(node.type);
};

var parseArray = function parseArray(node) {
  return new ArrayType(parseNode(node.items));
};

var parseNode = function parseNode(node) {
  if (typeof node.$ref === 'string') return resolveRef(node);
  if (Array.isArray(node.allOf) || Array.isArray(node.anyOf) || Array.isArray(node.oneOf)) {
    var baseNode = Object.assign({}, node);
    delete baseNode.allOf;
    delete baseNode.anyOf;
    delete baseNode.oneOf;
    var baseType = parseNode(baseNode);

    var withAllOf = Array.isArray(node.allOf) ? new (Function.prototype.bind.apply(UnionType, [null].concat([baseType], _toConsumableArray(node.allOf.map(parseNode)))))() : baseType;
    var withAnyOf = Array.isArray(node.anyOf) ? new UnionType(withAllOf, new (Function.prototype.bind.apply(EnumType, [null].concat(_toConsumableArray(node.anyOf.map(parseNode)))))()) : withAllOf;
    var withOneOf = Array.isArray(node.oneOf) ? new UnionType(withAnyOf, new (Function.prototype.bind.apply(EnumType, [null].concat(_toConsumableArray(node.oneOf.map(parseNode)))))()) : withAnyOf;

    return withOneOf;
  }

  if (node.type === 'object' || hasKeys(node.properties) || Array.isArray(node.required)) return parseObject(node);

  if (node.type === 'string' || node.type === 'boolean' || node.type === 'integer' || typeof node.format === 'string' || Array.isArray(node.enum) || node.type === 'number') return parsePrimitive(node);
  if (node.type === 'array') return parseArray(node);

  if (Array.isArray(node.enum)) return parsePrimitive(node);
  return parseObject(node);
};

var formatTypeExpression = function formatTypeExpression(type) {
  return type.render();
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

var args = yargs.command(['generate [files..]', '*'], 'generate types from json schemas').option('write', {
  describe: 'write types to file',
  type: 'boolean',
  default: false,
  alias: 'w'
}).option('pretty', {
  describe: 'pretty-print types',
  type: 'boolean',
  default: true,
  alias: 'p'
}).help().argv;

args.files.forEach(function (file) {
  var jsonSchema = JSON.parse(fs.readFileSync(file));
  var types = generateTypes(jsonSchema);
  var formatted = formatTypes(types, args.pretty);

  if (args.write) {
    fs.writeFileSync(file + '.flow.js', '// @flow\n' + formatted);
    console.log('✔️ ' + file);
  } else {
    console.log(formatted);
  }
});
