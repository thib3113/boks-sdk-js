import fs from 'fs';
const file = './tests/client/BoksEventRouter.test.ts';
let code = fs.readFileSync(file, 'utf8');

const testCode = `  it('should call onError callback when a listener throws an error', () => {
    const router = new BoksEventRouter<TestEventMap>();
    const testError = new Error('Test Error');
    const onError = vi.fn();

    router.on('TX', () => {
      throw testError;
    });

    const packet = new AskDoorStatusPacket();
    router.emitClientEvent(packet, 'TX', onError);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(testError);
  });
`;

code = code.replace(/}\);\n*$/, testCode + '});\n');
fs.writeFileSync(file, code);
console.log('Test added');
