# The missing coverage is lines 97, and 165-172 of src/utils/converters.ts
# Let's inspect src/utils/converters.ts to see what these lines are.

with open('src/utils/converters.ts', 'r') as f:
    lines = f.readlines()

print("Line 97:")
print(lines[96])
print("Lines 165-172:")
for i in range(164, 172):
    print(lines[i].strip())
