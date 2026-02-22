import re

with open('src/data/courses.ts', 'r') as f:
    content = f.read()

# Extract course blocks
blocks = re.findall(r'\{[^{}]*id:[^{}]*\}', content, re.DOTALL)

stats = {}

for block in blocks:
    flow_match = re.search(r'flow_code:\s*["\']([A-Z])["\']', block)
    comp_match = re.search(r'is_flow_compulsory:\s*(true|false)', block)

    if flow_match and comp_match:
        flow = flow_match.group(1)
        is_comp = comp_match.group(1) == 'true'

        if flow not in stats:
            stats[flow] = {'compulsory': 0, 'total': 0}

        stats[flow]['total'] += 1
        if is_comp:
            stats[flow]['compulsory'] += 1

for flow, data in sorted(stats.items()):
    print(f"Flow {flow}: Total {data['total']}, Compulsory {data['compulsory']}")
