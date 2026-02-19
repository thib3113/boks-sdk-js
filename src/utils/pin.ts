import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Validates a Boks PIN code.
 * A valid PIN must be exactly 6 characters long and only contain 0-9, A or B.
 *
 * @param pin The PIN code to validate.
 * @throws BoksProtocolError if the PIN is invalid.
 */
export function validatePinCode(pin: string): void {
  if (!/^[0-9A-B]{6}$/.test(pin)) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_VALUE,
      'PIN must be exactly 6 characters using only 0-9, A, and B',
      { received: pin }
    );
  }
}
