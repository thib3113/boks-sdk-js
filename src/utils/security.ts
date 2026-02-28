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
