import { describe, it, expect } from 'vitest';
import * as Core from '../src/core';

describe('core.ts exports', () => {
  it('should export all expected modules', () => {
    // Check for some known exports to ensure the file is loaded and evaluated
    expect(Core.generateBoksPin).toBeDefined();
    expect(Core.BoksPacketFactory).toBeDefined();
    expect(Core.bytesToHex).toBeDefined();

    expect(Core.validatePinCode).toBeDefined();
    expect(Core.BoksProtocolError).toBeDefined();

  });
});
