import { describe, it, expect } from 'vitest';
import { generateBoksPin } from '../../src/crypto/pin-algorithm';
import { hexToBytes } from '../../src/utils/converters';

describe('PIN Algorithm - Secure Non-Regression', () => {
  // Neutral Test Key (Not a real device key)
  const TEST_KEY = hexToBytes("00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF");

  // Golden Vectors for the first 100 single-use codes
  const GOLDEN_SINGLE_USE = [
    "A85B0A","61872B","18351B","060BA7","95B328","3369A1","769BB2","894B10","766333","403216",
    "A52188","567440","876023","7768B1","562218","83367A","543A15","B7BB6B","044505","463B82",
    "655098","1365A8","493611","839991","633816","500764","548402","201982","69914A","8BA272",
    "18626B","9096AB","1B859B","27AA35","A87852","B14529","A01BB3","598643","718950","91731A",
    "490A8A","72A19A","961952","452622","934B67","231B12","A03387","AB1500","689A61","492310",
    "600618","76A234","041238","A5B751","9134B2","889674","2A7431","301225","835485","822129",
    "B50A8B","8AB30B","443850","A11951","A89323","769115","674296","436594","9B6192","36468A",
    "28A7B0","6BA1A1","426318","4676B2","67A766","41B4B5","66A7B2","B9AB46","7502A6","852111",
    "076562","B9735A","46A9A8","37194B","6A293A","535562","4B2A32","019339","991180","B03994",
    "1577BB","654B73","A41933","938A75","024081","190791","833BA3","7A1020","670820","757392"
  ];

  it('should generate identical single-use PINs for 100 consecutive indices', () => {
    GOLDEN_SINGLE_USE.forEach((expected, index) => {
      const pin = generateBoksPin(TEST_KEY, "single-use", index);
      expect(pin).toBe(expected);
    });
  });

  it('should generate consistent master pins', () => {
    // Vector for Master 0 with Test Key
    const master0 = generateBoksPin(TEST_KEY, "master", 0);
    expect(master0).toBe("A02651");
  });

  describe('Edge Case Keys', () => {
    it('should generate consistent pins with All Zeros key', () => {
      const ZERO_KEY = new Uint8Array(32).fill(0);
      const expected = ["AB5B58","4B2606","0AA529","982648","951116","316B16","9745A7","756B65","AB975B","532112"];
      expected.forEach((val, i) => {
        expect(generateBoksPin(ZERO_KEY, "single-use", i)).toBe(val);
      });
    });

    it('should generate consistent pins with All FF key', () => {
      const FF_KEY = new Uint8Array(32).fill(0xFF);
      const expected = ["B5A6B3","6336A1","932968","78A102","5669B8","556B70","6A775B","119BB7","020379","399316"];
      expected.forEach((val, i) => {
        expect(generateBoksPin(FF_KEY, "single-use", i)).toBe(val);
      });
    });
  });

  describe('Variable Message Lengths (High Indices)', () => {
    it('should generate correct pin for 3-digit index (500)', () => {
      expect(generateBoksPin(TEST_KEY, "single-use", 500)).toBe("7813B5");
    });

    it('should generate correct pin for maximum theoretical index (3327)', () => {
      expect(generateBoksPin(TEST_KEY, "single-use", 3327)).toBe("63899A");
    });
  });
});
