/**
 * A class decorator that seals the constructor and its prototype.
 * Sealing prevents new properties from being added and existing properties from being removed.
 * It does not freeze the values of properties, which means existing properties can still be modified
 * if they are writable.
 * This helps prevent prototype pollution attacks and unauthorized extensions of sensitive objects.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

/**
 * A class decorator that deeply freezes the constructor and its prototype.
 * Freezing makes the object completely immutable: no new properties can be added,
 * existing properties cannot be removed, and existing properties cannot be modified.
 * This is useful for static registries or configuration classes.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function freeze(constructor: Function) {
  Object.freeze(constructor);
  Object.freeze(constructor.prototype);
}
