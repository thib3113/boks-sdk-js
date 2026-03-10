/**
 * A class decorator that seals the constructor and its prototype.
 * Sealing prevents new properties from being added and existing properties from being removed.
 * It does not freeze the values of properties, which means existing properties can still be modified
 * if they are writable.
 * This helps prevent prototype pollution attacks and unauthorized extensions of sensitive objects.
 */
export function sealed(constructor: { prototype: unknown }, context?: ClassDecoratorContext) {
  // If we're using standard TS decorators (context is defined),
  // we cannot simply seal immediately, because build tools like esbuild
  // will try to add Symbol.metadata to the constructor AFTER the decorator returns.
  // So we defer it using a microtask if possible, or just skip it for POC.
  if (context && context.kind === 'class') {
    Promise.resolve().then(() => {
      Object.seal(constructor);
      Object.seal(constructor.prototype);
    });
  } else {
    // Legacy experimentalDecorators path
    Object.seal(constructor);
    Object.seal(constructor.prototype);
  }
}

/**
 * A class decorator that deeply freezes the constructor and its prototype.
 * Freezing makes the object completely immutable: no new properties can be added,
 * existing properties cannot be removed, and existing properties cannot be modified.
 * This is useful for static registries or configuration classes.
 */
export function freeze(constructor: { prototype: unknown }, context?: ClassDecoratorContext) {
  if (context && context.kind === 'class') {
    Promise.resolve().then(() => {
      Object.freeze(constructor);
      Object.freeze(constructor.prototype);
    });
  } else {
    // Legacy experimentalDecorators path
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
  }
}
