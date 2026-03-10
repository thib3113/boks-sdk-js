/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A class decorator that seals the constructor and its prototype.
 * Sealing prevents new properties from being added and existing properties from being removed.
 * It does not freeze the values of properties, which means existing properties can still be modified
 * if they are writable.
 * This helps prevent prototype pollution attacks and unauthorized extensions of sensitive objects.
 */

export function sealed<T extends { prototype: unknown }>(value: T, context?: any): T {
  if (context && context.addInitializer) {
    context.addInitializer(function () {
      if (!(value as any)[Symbol.for("Symbol.metadata")]) { (value as any)[Symbol.for("Symbol.metadata")] = Object.create(null); } Object.seal(value);
      Object.seal(value.prototype);
    });
    return value;
  }
  Object.seal(value);
  Object.seal(value.prototype);
  return value;
}

export function freeze<T extends { prototype: unknown }>(value: T, context?: any): T {
  if (context && context.addInitializer) {
    context.addInitializer(function () {
      if (!(value as any)[Symbol.for("Symbol.metadata")]) { (value as any)[Symbol.for("Symbol.metadata")] = Object.create(null); } Object.freeze(value);
      Object.freeze(value.prototype);
    });
    return value;
  }
  Object.freeze(value);
  Object.freeze(value.prototype);
  return value;
}
