import { performance } from 'perf_hooks';

const ITERATIONS = 100000;
const SUBSCRIBERS = 100;

console.log('--- Benchmarking BoksClient Sub/Unsub ---');

const testArray = () => {
  let listeners: Array<(packet: any) => void> = [];

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const unsubs = [];
    // subscribe
    for (let j = 0; j < SUBSCRIBERS; j++) {
      const cb = () => {};
      listeners.push(cb);
      unsubs.push(() => {
        listeners = listeners.filter((l) => l !== cb);
      });
    }
    // unsubscribe
    for (let j = 0; j < SUBSCRIBERS; j++) {
      unsubs[j]();
    }
  }
  const end = performance.now();
  return end - start;
};

const testSet = () => {
  let listeners: Set<(packet: any) => void> = new Set();

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const unsubs = [];
    // subscribe
    for (let j = 0; j < SUBSCRIBERS; j++) {
      const cb = () => {};
      listeners.add(cb);
      unsubs.push(() => {
        listeners.delete(cb);
      });
    }
    // unsubscribe
    for (let j = 0; j < SUBSCRIBERS; j++) {
      unsubs[j]();
    }
  }
  const end = performance.now();
  return end - start;
};

const arrayTime = testArray();
const setTime = testSet();

console.log(`Array.filter implementation: ${arrayTime.toFixed(2)} ms`);
console.log(`Set implementation: ${setTime.toFixed(2)} ms`);
console.log(`Improvement: ${((arrayTime - setTime) / arrayTime * 100).toFixed(2)}% faster`);
