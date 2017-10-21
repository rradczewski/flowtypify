// @flow
import { equals } from 'ramda';

export interface TypeExpression {
  render(): string;
  toString(): string;
  equals(o: any): boolean;
}

export class SimpleType implements TypeExpression {
  typeName: string;

  constructor(typeName: string) {
    this.typeName = typeName;
  }

  render() {
    return this.typeName;
  }

  toString() {
    return `SimpleType(${this.typeName})`;
  }

  equals(o: any) {
    return o instanceof SimpleType && equals(this.typeName, o.typeName);
  }
}

export class UnionType implements TypeExpression {
  childTypes: Array<TypeExpression>;

  constructor(...childTypes: Array<TypeExpression>) {
    this.childTypes = childTypes;
  }

  render() {
    return this.childTypes.length === 1
      ? this.childTypes[0].render()
      : `(${this.childTypes.map(childType => childType.render()).join(' & ')})`;
  }

  toString() {
    return `UnionType(${this.childTypes
      .map(childType => childType.toString())
      .join(', ')})`;
  }

  equals(o: any) {
    return o instanceof UnionType && equals(this.childTypes, o.childTypes);
  }
}

export class EnumType implements TypeExpression {
  childTypes: Array<TypeExpression>;

  constructor(...childTypes: Array<TypeExpression>) {
    this.childTypes = childTypes;
  }

  render() {
    return this.childTypes.length === 1
      ? this.childTypes[0].render()
      : `(${this.childTypes.map(childType => childType.render()).join(' | ')})`;
  }

  toString() {
    return `EnumType(${this.childTypes
      .map(childType => childType.toString())
      .join(', ')})`;
  }

  equals(o: any) {
    return o instanceof EnumType && equals(this.childTypes, o.childTypes);
  }
}

export class ArrayType implements TypeExpression {
  itemType: TypeExpression;

  constructor(itemType: TypeExpression) {
    this.itemType = itemType;
  }

  render() {
    return `Array<${this.itemType.render()}>`;
  }

  toString() {
    return `Array(${this.itemType.toString()})`;
  }

  equals(o: any) {
    return o instanceof ArrayType && equals(this.itemType, o.itemType);
  }
}

export class OptionalType implements TypeExpression {
  childType: TypeExpression;

  constructor(childType: TypeExpression) {
    this.childType = childType;
  }

  render() {
    return `?${this.childType.render()}`;
  }

  toString() {
    return `Optional(${this.childType.toString()})`;
  }

  equals(o: any) {
    return o instanceof OptionalType && equals(this.childType, o.childType);
  }
}

export class ObjectType implements TypeExpression {
  properties: { [string]: TypeExpression };

  constructor(properties: { [string]: TypeExpression }) {
    this.properties = properties;
  }

  render() {
    return `{ ${Object.keys(this.properties)
      .map(key => `${key}: ${this.properties[key].render()}`)
      .join(', ')} }`;
  }

  toString() {
    return `Object(${Object.keys(this.properties)
      .map(key => `${key}: ${this.properties[key].toString()}`)
      .join(', ')})`;
  }

  equals(o: any) {
    return o instanceof ObjectType && equals(this.properties, o.properties);
  }
}

export class ConstantType implements TypeExpression {
  constant: string | number;

  constructor(constant: string | number) {
    this.constant = constant;
  }

  render() {
    if (typeof this.constant === 'string') {
      return `"${this.constant}"`;
    } else {
      return String(this.constant);
    }
  }

  toString() {
    return `Constant(${this.render()})`;
  }

  equals(o: any) {
    return o instanceof ConstantType && equals(this.constant, o.constant);
  }
}
