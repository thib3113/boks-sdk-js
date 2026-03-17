import { describe, expect, it } from 'vitest';
import { PayloadMapper, PayloadConfigKey, PayloadHexString, PayloadPinCode, getOrCreateMetadata } from '@/protocol/decorators';
import { METADATA_KEY } from '@/protocol/decorators/PayloadMetadata';
import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';

class TestConfigKeyPacket {
  @PayloadConfigKey(0)
  public accessor configKey: string = '';

  constructor(public rawPayload?: Uint8Array) {}
}

describe('PayloadMapper Coverage additions', () => {
  describe('config_key decorator', () => {
    it('should successfully parse valid config key', () => {
      // 8 ascii bytes representing hex: '01234567'
      const payload = new Uint8Array([48, 49, 50, 51, 52, 53, 54, 55]);
      const result = PayloadMapper.parse(TestConfigKeyPacket, payload);
      expect(result.configKey).toBe('01234567');
    });

    it('should successfully serialize valid config key', () => {
      const inst = new TestConfigKeyPacket();
      inst.configKey = '89ABCDEF';
      const result = PayloadMapper.serialize(inst);
      expect(result.length).toBe(8);
      expect(String.fromCharCode(...result)).toBe('89ABCDEF');
    });

    it('should throw BoksProtocolError when validating invalid length config_key', () => {
      const inst = new TestConfigKeyPacket();
      expect(() => {
        inst.configKey = '1234';
      }).toThrow(BoksProtocolError);
    });

    it('should throw BoksProtocolError when validating non-hex config_key', () => {
      const inst = new TestConfigKeyPacket();
      expect(() => {
        inst.configKey = '0123456Z';
      }).toThrow(BoksProtocolError);
    });
  });

  describe('coverage on non-Symbol.metadata class', () => {
    it('should instantiate gracefully without metadata', () => {
      class NoMetaPacket {}
      // Will be empty mappings.
      const res = PayloadMapper.parse(NoMetaPacket, new Uint8Array(10));
      expect(res).toBeDefined();
    });
  });

  describe('coverage for validate uncached', () => {
    it('should compile validator when missing', () => {
      class ValidatorPacket {
        @PayloadConfigKey(0)
        public accessor key: string = '';
      }
      const inst = new ValidatorPacket();
      inst.key = '01234567';
      PayloadMapper.validate(inst); // triggers uncached validation flow
      PayloadMapper.validate(inst); // triggers cached validation flow
    });
  });

  describe('coverage for remaining edge cases', () => {
    it('should cover AuthPacket.extractConfigKey', () => {
      const payload = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38]);
      expect(AuthPacket.extractConfigKey(payload)).toBe('12345678');
    });

    it('should clone metadata when inherited via prototype', () => {
      const parentMeta = [{ propertyName: 'test', type: 'uint8' as any, offset: 0 }];
      const metadataObj = Object.create(null);
      metadataObj[METADATA_KEY] = parentMeta;

      // Create child that inherits from metadataObj but doesn't have METADATA_KEY as own property
      const childMetadata = Object.create(metadataObj);

      const mockContext: any = {
        metadata: childMetadata
      };

      const result = getOrCreateMetadata(mockContext);
      expect(result).toEqual(parentMeta);
      expect(Object.prototype.hasOwnProperty.call(childMetadata, METADATA_KEY)).toBe(true);
      expect(childMetadata[METADATA_KEY]).not.toBe(parentMeta); // Should be a clone
    });

    it('should handle hex_string with 0 length', () => {
      class ZeroHexPacket {
        @PayloadHexString(0, 0)
        public accessor emptyHex!: string;
      }
      const inst = new ZeroHexPacket();
      inst.emptyHex = '';
      const serialized = PayloadMapper.serialize(inst);
      expect(serialized.length).toBe(0);

      const parsed = PayloadMapper.parse<ZeroHexPacket>(ZeroHexPacket, new Uint8Array([]));
      expect(parsed.emptyHex).toBe('');
    });

    it('should throw BoksProtocolError when validating pin_code with non-string type', () => {
      class ValidatorPinPacket {
        public pin: any = 123456;
      }
      // Manually define schema to bypass decorator setter logic and trigger JIT branch
      PayloadMapper.defineSchema(ValidatorPinPacket, [
        { propertyName: 'pin', type: 'pin_code', offset: 0, length: 6 }
      ]);

      const inst = new ValidatorPinPacket();
      expect(() => PayloadMapper.validate(inst)).toThrow(BoksProtocolError);
    });

    it('should cover all setter error branches for Pin and ConfigKey', () => {
      class EdgePacket {
        @PayloadPinCode(0) public accessor pin!: any;
        @PayloadConfigKey(6) public accessor key!: any;
      }
      const inst = new EdgePacket();
      expect(() => (inst.pin = null)).toThrow(BoksProtocolError);
      expect(() => (inst.pin = undefined)).toThrow(BoksProtocolError);
      expect(() => (inst.key = null)).toThrow(BoksProtocolError);
      expect(() => (inst.key = undefined)).toThrow(BoksProtocolError);

      // Trigger String(val) conversion branch
      (inst as any).pin = 123456;
      expect(inst.pin).toBe('123456');
      (inst as any).key = 12345678;
      expect(inst.key).toBe('12345678');
    });

    it('should clone metadata when inherited via prototype (manual trigger for line 53)', () => {
      const parentMeta = [{ propertyName: 'parent', type: 'uint8', offset: 0 }];
      const proto = { [METADATA_KEY]: parentMeta };
      const obj = Object.create(proto);
      const context: any = { metadata: obj };
      
      const result = getOrCreateMetadata(context);
      
      expect(Object.prototype.hasOwnProperty.call(obj, METADATA_KEY)).toBe(true);
      expect(obj[METADATA_KEY]).not.toBe(parentMeta);
      expect(result).toEqual(parentMeta);
    });

    it('should clone metadata for child classes (real inheritance)', () => {
      class Parent {
        @PayloadConfigKey(0) public accessor k1: string = '12345678';
      }
      class Child extends Parent {
        @PayloadConfigKey(8) public accessor k2: string = '87654321';
      }
      const c = new Child();
      const serialized = PayloadMapper.serialize(c);
      expect(serialized.length).toBe(16);
    });

    it('should throw BoksProtocolError if payload is an Array instead of Uint8Array', () => {
      class EmptyPkt {}
      expect(() => PayloadMapper.parse(EmptyPkt, [1, 2, 3] as any)).toThrow(BoksProtocolError);
    });

    it('should throw BoksProtocolError when serializing object without constructor', () => {
      const obj = Object.create(null);
      expect(() => PayloadMapper.serialize(obj)).toThrow(BoksProtocolError);
    });
  });
});
