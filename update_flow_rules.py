import re

with open('src/data/flowRules.ts', 'r') as f:
    content = f.read()

# Replace X.X.XXXX.X with XXXX
# Regex to match 3.4.3136.6 etc.
# Pattern: \d\.\d\.(\d{4})\.\d
new_content = re.sub(r'\d\.\d\.(\d{4})\.\d', r'\1', content)

with open('src/data/flowRules.ts', 'w') as f:
    f.write(new_content)
