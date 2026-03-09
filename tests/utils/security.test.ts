import { describe, it, expect } from 'vitest';
import { sealed, freeze } from '../../src/utils/security';

describe('security decorators', () => {
  describe('@sealed', () => {
    @sealed
    class SealedClass {
      public static staticProp = 1;
      public prop = 1;
    }

    it('should seal the constructor', () => {
      expect(Object.isSealed(SealedClass)).toBe(true);
    });

    it('should seal the prototype', () => {
      expect(Object.isSealed(SealedClass.prototype)).toBe(true);
    });

    it('should not allow adding new properties to the constructor', () => {
      expect(() => {
        (SealedClass as any).newProp = 'test';
      }).toThrow();
    });

    it('should not allow adding new properties to the prototype', () => {
      expect(() => {
        (SealedClass.prototype as any).newMethod = () => {};
      }).toThrow();
    });

    it('should still allow modifying existing static properties', () => {
      (SealedClass as any).staticProp = 2;
      expect(SealedClass.staticProp).toBe(2);
    });

    it('should allow instances to be modified (unless they are also sealed)', () => {
      const instance = new SealedClass();
      instance.prop = 2;
      (instance as any).newProp = 3;
      expect(instance.prop).toBe(2);
      expect((instance as any).newProp).toBe(3);
    });
  });

  describe('@freeze', () => {
    @freeze
    class FrozenClass {
      public static staticProp = 1;
      public prop = 1;
    }

    it('should freeze the constructor', () => {
      expect(Object.isFrozen(FrozenClass)).toBe(true);
    });

    it('should freeze the prototype', () => {
      expect(Object.isFrozen(FrozenClass.prototype)).toBe(true);
    });

    it('should not allow adding new properties to the constructor', () => {
      expect(() => {
        (FrozenClass as any).newProp = 'test';
      }).toThrow();
    });

    it('should not allow modifying existing static properties', () => {
      expect(() => {
        (FrozenClass as any).staticProp = 2;
      }).toThrow();
    });

    it('should not allow adding new properties to the prototype', () => {
      expect(() => {
        (FrozenClass.prototype as any).newMethod = () => {};
      }).toThrow();
    });

    it('should allow instances to be modified (unless they are also frozen)', () => {
      const instance = new FrozenClass();
      instance.prop = 2;
      (instance as any).newProp = 3;
      expect(instance.prop).toBe(2);
      expect((instance as any).newProp).toBe(3);
    });
  });
});
