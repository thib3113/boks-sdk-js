import { PayloadMapper } from './src/protocol/decorators/PayloadMapper.ts';

class MyPacket {
}

PayloadMapper.defineSchema(MyPacket, [
  {
    propertyName: 'myBit',
    type: 'bit',
    offset: 0,
    bitIndex: '1); console.log("HACKED bit serializer"); (1',
  } as any
]);

try {
  PayloadMapper.serialize({ myBit: true, constructor: MyPacket });
  console.log('Serialized MyPacket');
} catch (e) {
  console.error(e);
}
