import { BoksController, BoksClient } from '../src';
import { randomBytes } from 'crypto';

/**
 * Example function showing how to regenerate the Master Key (Provisioning) on a Boks.
 * WARNING: This is a critical operation. If successful, the old master key will
 * no longer work, and you MUST save the new one.
 */
async function regenerateKeyExample(currentMasterKeyHex: string) {
  // Use BoksController as it provides the high-level API
  const controller = new BoksController();

  try {
    console.log('Connecting to Boks...');
    await controller.connect();

    console.log('Setting current credentials...');
    // We must authenticate with the current Master Key to perform regeneration
    controller.setCredentials(currentMasterKeyHex);

    console.log('Generating a new random 32-byte Master Key...');
    // Generate a secure random 32-byte key
    const newMasterKeyBytes = randomBytes(32);
    const newMasterKeyHex = newMasterKeyBytes.toString('hex').toUpperCase();

    console.log(`New Master Key generated: ${newMasterKeyHex}`);
    console.log('Starting provisioning process...');

    // Call regenerateMasterKey and pass a progress callback
    const success = await controller.regenerateMasterKey(newMasterKeyHex, (progress) => {
      console.log(`Provisioning progress: ${progress}%`);
    });

    if (success) {
      console.log('✅ Provisioning successful!');
      console.log(`CRITICAL: Your new Master Key is: ${newMasterKeyHex}`);
      console.log('Please save it immediately. The old key is no longer valid.');
    } else {
      console.log('❌ Provisioning failed. The device may have rejected the operation.');
    }
  } catch (error) {
    console.error('An error occurred during provisioning:', error);
  } finally {
    await controller.disconnect();
    console.log('Disconnected.');
  }
}

// Usage Example:
// REPLACE this with your actual current 64-character hex master key.
// const CURRENT_KEY = "0000000000000000000000000000000000000000000000000000000000000000";
// regenerateKeyExample(CURRENT_KEY);
