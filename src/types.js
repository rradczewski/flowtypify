// @flow

export interface TypeExpression {
  render(): string;
}

export class SimpleType implements TypeExpression {
  typeName: string;

  constructor(typeName: string) {
    this.typeName = typeName;
  }

  render() {
    return this.typeName;
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
}

export class ArrayType implements TypeExpression {
  itemType: TypeExpression;

  constructor(itemType: TypeExpression) {
    this.itemType = itemType;
  }

  render() {
    return `Array<${this.itemType.render()}>`;
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
}
