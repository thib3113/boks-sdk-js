# Packet Visualizer

The Packet Visualizer is a helpful tool designed to decode and display the contents of a raw hexadecimal Boks Bluetooth LE packet.

This is particularly useful when debugging raw Bluetooth traffic or analyzing packet logs, allowing you to quickly understand the structure, opcode, length, and payload fields (such as code counts, pins, configurations, etc.), mapped directly to the SDK's protocol definition.

## Interactive Decoder

Try pasting a raw hexadecimal string into the input field below. The visualizer will automatically decode it, validate the checksum, and break down the bytes.

For example, you can try: `c30700020cffd7`

<script setup>
import PacketVisualizer from '../.vitepress/components/PacketVisualizer.vue'
</script>

<PacketVisualizer />

### How It Works

1. **Opcode (Pink/Red):** The first byte indicates the command or notification type (e.g., `C3` = `NOTIFY_CODES_COUNT`).
2. **Length (Green):** The second byte indicates the length of the payload that follows.
3. **Payload (Various Colors):** The bytes following the length byte are dynamically sliced based on the decorators defined in the SDK (e.g., `@PayloadUint16`, `@PayloadPinCode`).
4. **Checksum (Yellow):** The final byte is a calculated checksum to verify data integrity.

If a payload structure doesn't match the expected size, or if the checksum is invalid, the visualizer will display an error or leave unmapped payload bytes in grey.
