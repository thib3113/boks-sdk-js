import { describe, expect, it } from 'vitest';
import { PayloadMapper, PayloadConfigKey } from '@/protocol/payload-mapper';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

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
      expect(() => { inst.configKey = '1234' }).toThrow(BoksProtocolError);
    });

    it('should throw BoksProtocolError when validating non-hex config_key', () => {
      const inst = new TestConfigKeyPacket();
      expect(() => { inst.configKey = '0123456Z' }).toThrow(BoksProtocolError);
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
});
