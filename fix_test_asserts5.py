import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

# I need to add tests for `bytesToHex(new Uint8Array([]))` and `writeConfigKeyToBuffer`.
# Wait, did we remove `writeConfigKeyToBuffer` from tests? No, but it was not fully covered maybe?
# I'll just add tests for the missing coverage: empty Uint8Array and writeConfigKeyToBuffer.

test_coverage = """    it('formats empty array as empty string', () => {
      expect(bytesToHex(new Uint8Array([]))).toBe('');
    });

  });

  describe('writeConfigKeyToBuffer', () => {
    it('writes a config key to buffer at specific offset', () => {
      const payload = new Uint8Array(10);
      writeConfigKeyToBuffer(payload, 1, '12345678');
      expect(payload.subarray(1, 9)).toEqual(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56]));
    });
"""

content = content.replace("  });\n\n  describe('bytesToHex', () => {", f"{test_coverage}\n  describe('bytesToHex', () => {{")

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
