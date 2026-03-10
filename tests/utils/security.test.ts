import { describe, it, expect } from 'vitest';
import { sealed, freeze } from '@/utils/security';

describe('security decorators', () => {
  describe('sealed', () => {
    it('should seal the constructor and prototype', async () => {
      @sealed
      class TestClass {
        static staticProp = 1;
        instanceProp = 2;
      }

      await Promise.resolve(); // wait for microtask

      expect(Object.isSealed(TestClass)).toBe(true);
      expect(Object.isSealed(TestClass.prototype)).toBe(true);

      // Should still be able to modify existing properties
      (TestClass as any).staticProp = 3;
      expect(TestClass.staticProp).toBe(3);

      const instance = new TestClass();
      instance.instanceProp = 4;
      expect(instance.instanceProp).toBe(4);

      // Should not be able to add new properties to constructor
      try {
        (TestClass as any).newProp = 5;
      } catch (e) {
        // May throw in strict mode
      }
      expect((TestClass as any).newProp).toBeUndefined();
    });
  });

  describe('freeze', () => {
    it('should freeze the constructor and prototype', async () => {
      @freeze
      class TestClass {
        static staticProp = 1;
        instanceProp = 2;
      }

      await Promise.resolve(); // wait for microtask

      expect(Object.isFrozen(TestClass)).toBe(true);
      expect(Object.isFrozen(TestClass.prototype)).toBe(true);

      // Should NOT be able to modify existing properties on constructor
      try {
        (TestClass as any).staticProp = 3;
      } catch (e) {
        // May throw in strict mode
      }
      expect(TestClass.staticProp).toBe(1);
    });
  });
});
