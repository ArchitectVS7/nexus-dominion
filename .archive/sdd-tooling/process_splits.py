import json
import re
import subprocess

# Load SPEC-INDEX.json
with open(r'C:\dev\GIT\x-imperium\docs\development\SPEC-INDEX.json', 'r', encoding='utf-8') as f:
    index_data = json.load(f)

# Get all split candidates
candidates = []
for system_key, system_data in index_data['systems'].items():
    if 'specs' in system_data:
        for spec in system_data['specs']:
            if 'splitCandidate' in spec:
                candidates.append({
                    'id': spec['id'],
                    'line': spec.get('line'),
                    'file': system_data['file'],
                    'splitCandidate': spec['splitCandidate'],
                    'system': system_key
                })

print(f"Found {len(candidates)} split candidates")
for c in candidates:
    print(f"  {c['id']} at line {c['line']} in {c['file']}")
