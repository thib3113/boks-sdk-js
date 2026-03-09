import { performance } from 'perf_hooks';

// Simulate the listener setup
let listenersArray: Array<(packet: any) => void> = [];
const listenersSet: Set<(packet: any) => void> = new Set();

const ITERATIONS = 100000;
const callbacks: Array<(packet: any) => void> = [];

for (let i = 0; i < 100; i++) {
  const cb = () => {};
  callbacks.push(cb);
  listenersArray.push(cb);
  listenersSet.add(cb);
}

const cbToRemove = callbacks[50];

console.log('--- Benchmarking Unsubscribe ---');

// Array filter benchmark
const arrayStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  let arr = [...listenersArray];
  arr = arr.filter((l) => l !== cbToRemove);
}
const arrayEnd = performance.now();
console.log(`Array.filter: ${arrayEnd - arrayStart} ms`);

// Set delete benchmark
const setStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const set = new Set(listenersSet);
  set.delete(cbToRemove);
}
const setEnd = performance.now();
console.log(`Set.delete: ${setEnd - setStart} ms`);

console.log('--- Benchmarking Notify ---');

// Array forEach benchmark
const notifyArrayStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  listenersArray.forEach((cb) => cb({}));
}
const notifyArrayEnd = performance.now();
console.log(`Array.forEach: ${notifyArrayEnd - notifyArrayStart} ms`);

// Set forEach benchmark
const notifySetStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  listenersSet.forEach((cb) => cb({}));
}
const notifySetEnd = performance.now();
console.log(`Set.forEach: ${notifySetEnd - notifySetStart} ms`);
