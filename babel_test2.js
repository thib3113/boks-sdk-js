// WAIT
// The error is in `tests/protocol/PayloadMapper.exhaustive.test.ts`
// Because of my `fix_sec_errs.py` or `fix_everything.py` which ran:
//    files = glob.glob('src/**/*.ts', recursive=True) + glob.glob('tests/**/*.ts', recursive=True)
//    content = re.sub(r'\bbytesToMac\b', 'bytesToHex', content)
// Did `PayloadMapper.exhaustive.test.ts` contain `bytesToMac` and got mutated badly?
import fs from 'fs';
const code = fs.readFileSync('tests/protocol/PayloadMapper.exhaustive.test.ts', 'utf-8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes('bytesToHex as bytesToMac') || lines[i].includes('bytesToHex')) {
       console.log("LINE", i+1, ":", lines[i]);
   }
}
