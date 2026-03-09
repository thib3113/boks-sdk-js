import { performance } from 'perf_hooks';

// Simulate the listener setup
let listenersArray: Array<(packet: any) => void> = [];
const listenersSet: Set<(packet: any) => void> = new Set();

const ITERATIONS = 1000000;
const callbacks: Array<(packet: any) => void> = [];

for (let i = 0; i < 100; i++) {
  const cb = () => {};
  callbacks.push(cb);
  listenersArray.push(cb);
  listenersSet.add(cb);
}

const cbToRemove = callbacks[50];

console.log('--- Benchmarking Unsubscribe (In-place) ---');

// Array filter benchmark (in-place replacement)
const arrayStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  listenersArray = listenersArray.filter((l) => l !== cbToRemove);
  if (i === 0) listenersArray.push(cbToRemove); // Keep length consistent
}
const arrayEnd = performance.now();
console.log(`Array.filter: ${arrayEnd - arrayStart} ms`);

// Array splice benchmark (in-place modification)
const arraySpliceStart = performance.now();
let spliceArray = [...callbacks];
for (let i = 0; i < ITERATIONS; i++) {
  const index = spliceArray.indexOf(cbToRemove);
  if (index !== -1) {
    spliceArray.splice(index, 1);
  }
  if (i === 0) spliceArray.push(cbToRemove); // Keep length consistent
}
const arraySpliceEnd = performance.now();
console.log(`Array.indexOf + splice: ${arraySpliceEnd - arraySpliceStart} ms`);

// Set delete benchmark (in-place modification)
const setStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  listenersSet.delete(cbToRemove);
  if (i === 0) listenersSet.add(cbToRemove); // Keep size consistent
}
const setEnd = performance.now();
console.log(`Set.delete: ${setEnd - setStart} ms`);

console.log('--- Benchmarking Notify ---');

// Array for loop benchmark
const notifyArrayStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (let j = 0; j < listenersArray.length; j++) {
    listenersArray[j]({});
  }
}
const notifyArrayEnd = performance.now();
console.log(`Array for loop: ${notifyArrayEnd - notifyArrayStart} ms`);

// Set for...of benchmark
const notifySetStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (const cb of listenersSet) {
    cb({});
  }
}
const notifySetEnd = performance.now();
console.log(`Set for...of: ${notifySetEnd - notifySetStart} ms`);
