import re

file_path = 'src/simulator/BoksSimulator.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Define the new loadState method
new_loadState = """  private loadState(): void {
    if (!this.storage) return;

    const savedConfigKey = this.storage.get('configKey');
    if (savedConfigKey) this.configKey = savedConfigKey;

    const savedLogs = this.storage.get('logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs) as Array<{
          opcode: number;
          timestamp: number;
          payload: number[] | Record<string, number>;
        }>;
        this.logs = parsedLogs.map((log) => ({
          ...log,
          payload: new Uint8Array(Object.values(log.payload)) // Rehydrate Uint8Array
        }));
      } catch (e) {
        console.warn('Failed to load logs:', e);
      }
    }

    const savedPins = this.storage.get('pinCodes');
    if (savedPins) {
      try {
        const parsedPins = JSON.parse(savedPins);
        this.pinCodes = new Map(parsedPins);
      } catch (e) {
        console.warn('Failed to load pin codes:', e);
      }
    }

    const savedMasterCodes = this.storage.get('masterCodes');
    if (savedMasterCodes) {
      try {
        const parsed = JSON.parse(savedMasterCodes);
        this.masterCodes = new Map(parsed);
      } catch (e) {
        console.warn('Failed to load master codes:', e);
      }
    }

    const savedNfcTags = this.storage.get('nfcTags');
    if (savedNfcTags) {
      try {
        const parsed = JSON.parse(savedNfcTags);
        this.nfcTags = new Set(parsed);
      } catch (e) {
        console.warn('Failed to load nfc tags:', e);
      }
    }

    const savedConfig = this.storage.get('configuration');
    if (savedConfig) {
      try {
        this.configuration = JSON.parse(savedConfig);
      } catch (e) {
        console.warn('Failed to load configuration:', e);
      }
    }
  }"""

# Define the new saveState method
new_saveState = """  private saveState(): void {
    if (!this.storage) return;

    this.storage.set('configKey', this.configKey);

    // Serialize logs (handle Uint8Array)
    const serializableLogs = this.logs.map((log) => ({
      ...log,
      payload: Array.from(log.payload)
    }));
    this.storage.set('logs', JSON.stringify(serializableLogs));

    // Serialize Map
    this.storage.set('pinCodes', JSON.stringify(Array.from(this.pinCodes.entries())));
    this.storage.set('masterCodes', JSON.stringify(Array.from(this.masterCodes.entries())));
    this.storage.set('nfcTags', JSON.stringify(Array.from(this.nfcTags)));
    this.storage.set('configuration', JSON.stringify(this.configuration));
  }"""

# Replace loadState
# We use regex to find the block. It starts with private loadState... and ends before private saveState
load_pattern = r"private loadState\(\): void \{[\s\S]*?^\s*private saveState"
# This regex is risky because it relies on method ordering.
# Instead, let's look for the exact signature and match braces? No, regex is better if we anchor it.

# Let's replace the whole block from loadState start to end of saveState.
block_pattern = r"(private loadState\(\): void \{[\s\S]*?^\s*\})(\s*)(private saveState\(\): void \{[\s\S]*?^\s*  \})"

# Actually, the original code had:
#   private loadState(): void { ... }
#
#   private saveState(): void { ... }

# Let's verify the file content around lines 159-206
lines = content.splitlines()
start_load = 158 # 0-indexed, line 159 in file
# We need to find where saveState ends.
# saveState starts around 193. It ends when indentation closes.

# A safer approach: find the exact string of the old methods and replace.
old_loadState_start = "  private loadState(): void {"
old_saveState_start = "  private saveState(): void {"

# We can reconstruct the old block based on  output
old_block_part1 = """  private loadState(): void {
    if (!this.storage) return;

    const savedConfigKey = this.storage.get('configKey');
    if (savedConfigKey) this.configKey = savedConfigKey;

    const savedLogs = this.storage.get('logs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs) as Array<{
          opcode: number;
          timestamp: number;
          payload: number[] | Record<string, number>;
        }>;
        this.logs = parsedLogs.map((log) => ({
          ...log,
          payload: new Uint8Array(Object.values(log.payload)) // Rehydrate Uint8Array
        }));
      } catch (e) {
        console.warn('Failed to load logs:', e);
      }
    }

    const savedPins = this.storage.get('pinCodes');
    if (savedPins) {
      try {
        const parsedPins = JSON.parse(savedPins);
        this.pinCodes = new Map(parsedPins);
      } catch (e) {
        console.warn('Failed to load pin codes:', e);
      }
    }
  }"""

old_block_part2 = """  private saveState(): void {
    if (!this.storage) return;

    this.storage.set('configKey', this.configKey);

    // Serialize logs (handle Uint8Array)
    const serializableLogs = this.logs.map((log) => ({
      ...log,
      payload: Array.from(log.payload)
    }));
    this.storage.set('logs', JSON.stringify(serializableLogs));

    // Serialize Map
    this.storage.set('pinCodes', JSON.stringify(Array.from(this.pinCodes.entries())));
  }"""

# Check if these exact strings exist
if old_block_part1 in content:
    print("Found old loadState")
    content = content.replace(old_block_part1, new_loadState)
else:
    print("Could not find exact match for loadState. Trying loose match.")
    # Fallback logic if needed, but let's see.

if old_block_part2 in content:
    print("Found old saveState")
    content = content.replace(old_block_part2, new_saveState)
else:
    print("Could not find exact match for saveState")

with open(file_path, 'w') as f:
    f.write(content)
