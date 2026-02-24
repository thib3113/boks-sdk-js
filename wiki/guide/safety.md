# Safety & Troubleshooting

## Door Opening Safety Delay

To prevent mechanical issues and ensure reliable operation, the Boks SDK enforces a **1-second mandatory delay** between consecutive calls to `openDoor()`.

If you attempt to open the door again within 1 second of the previous attempt, the SDK will throw a `BoksClientError` with the ID `RATE_LIMIT_REACHED`.

```typescript
try {
  await controller.openDoor('123456');
  // ... immediately try again
  await controller.openDoor('123456');
} catch (error) {
  if (error.id === 'RATE_LIMIT_REACHED') {
    console.error('Please wait a moment before trying again.');
  }
}
```

## The "Stuck Motor" Quirk

The locking mechanism in Boks devices uses a motor that operates in two stages. Rapidly repeated opening commands can interrupt this cycle, causing the motor to freeze in an intermediate state.

### Symptoms
- The door is physically open but the device believes it is not fully open.
- The device refuses to latch or close properly.
- You hear the motor trying to move but getting stuck.

### Manual Fix
If you encounter this issue, follow these steps to reset the mechanism:

1.  **Hold the door closed manually.** You need to apply pressure to keep the door in the closed position, countering the lock's attempt to re-open or stay open.
2.  **Enter a valid PIN code.** Use the keypad or the app to trigger a standard opening sequence.
3.  **Let the door open normally.** Release the door as the mechanism unlocks.
4.  **Close the door.** The mechanism should now be reset and function correctly.

This procedure forces the motor to complete its full cycle, realigning the internal gears and sensors.
