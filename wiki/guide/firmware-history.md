# Firmware History & Evolution

The Boks firmware has evolved through several major functional milestones. This page tracks the evolution of the protocol and hardware capabilities.

## Summary Table

| Version | Key Milestone | Main Changes |
|---------|---------------|--------------|
| **4.2.0** | **Vigik Support** | Added support for Vigik access protocol. |
| **4.3.3** | **User NFC Tags** | Introduced support for discovery and registration of standard user NFC tags. |
| **4.5.1** | **Regeneration Functions** | Added Opcodes `0x20/0x21` to replace the `masterKey` and all offline codes. |
| **4.6.0** | **Log Security** | PIN codes are no longer returned in history logs (replaced by indices). |

---

## Detailed Evolution

### Version 4.2.0: Vigik Integration
This version introduced the ability for the Boks to be opened using Vigik-compatible credentials, primarily used by official delivery services.

### Version 4.3.3: User NFC Tags
- **Tag Management**: Users can now scan and register their own NFC tags to open the box without using a PIN or smartphone.
- **Multi-Use Codes**: This is the last version supporting the generation of **Multi-Use Codes**. This feature is disabled in all versions strictly greater than 4.3.3.

### Version 4.5.1: Key & Code Replacement
- **Provisioning 2.0**: Introduction of the "Regeneration" workflow. Unlike the initial `GENERATE_CODES` (0x10), the new Opcodes `0x20` (Part A) and `0x21` (Part B) allow a client to completely replace the `masterKey` and the associated pool of offline codes.

### Version 4.6.0: Enhanced Log Privacy
- **PIN Masking**: To prevent unauthorized users from retrieving valid codes by sniffing the history buffer, the firmware no longer returns raw 6-character PINs in the logs.
- **Index-based Logging**: The log payload now contains a reference index:
    - **MCxxxx**: Represents a **Permanent** code.
    - **UCxxxx**: Represents a **Single-Use** code.
    - *Example*: Instead of `"123456"`, the log might return `"MC0001"`.

---

## Specific Models

### Professional Boks
Integrated scale support (Opcodes `0x50` to `0x62`) is available on **Professional models**. These commands allow bonding a Boks Scale, taring, and retrieving real-time weight measurements.
