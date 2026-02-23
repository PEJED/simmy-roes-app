import json
import os
import re

# Read courses.ts
with open('src/data/courses.ts', 'r') as f:
    content = f.read()

# Extract the array
match = re.search(r'export const courses: Course\[\] = (\[.*\]);', content, re.DOTALL)
if match:
    courses_json = match.group(1)
    # Fix JS object syntax to JSON (keys unquoted, single quotes)
    courses_json = re.sub(r'(\w+):', r'"\1":', courses_json)
    courses_json = courses_json.replace("'", '"')
    # Remove trailing commas
    courses_json = re.sub(r',\s*\}', '}', courses_json)
    courses_json = re.sub(r',\s*\]', ']', courses_json)

    try:
        courses = json.loads(courses_json)

        flow_stats = {}

        for c in courses:
            f = c.get('flow_code')
            if not f: continue
            if f not in flow_stats:
                flow_stats[f] = {'compulsory': 0, 'elective': 0, 'total': 0, 'compulsory_ids': []}

            flow_stats[f]['total'] += 1
            if c.get('is_flow_compulsory'):
                flow_stats[f]['compulsory'] += 1
                flow_stats[f]['compulsory_ids'].append(c['id'])
            else:
                flow_stats[f]['elective'] += 1

        print(json.dumps(flow_stats, indent=2))

    except Exception as e:
        print(f"Error parsing JSON: {e}")
else:
    print("Could not find courses array")
