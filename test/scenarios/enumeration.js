import { EnumType, ConstantType } from '../../src/types';

export default {
  RootType: new EnumType(new ConstantType("foo"), new ConstantType("bar"))
}
