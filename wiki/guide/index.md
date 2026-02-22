# Getting Started

The Boks SDK is a reverse-engineered library to interact with Boks parcel boxes.

## Installation

```bash
npm install @thib3113/boks-sdk
```

## Quick Start

```typescript
import { BoksController } from '@thib3113/boks-sdk';

const controller = new BoksController({ device });
await controller.connect();
```

## Warning

This project is **unofficial** and **experimental**. Use it at your own risk.
