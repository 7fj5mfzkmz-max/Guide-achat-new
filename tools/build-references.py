import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'data' / 'phone-references.json').read_text())
assert isinstance(data['phones'], list)
path = root / 'phone-analyzer/references.js'
s = path.read_text()
a = s.index('var data = ') + len('var data = ')
b = s.index(';\nfunction norm', a)
path.write_text(s[:a] + json.dumps(data, ensure_ascii=False) + s[b:])
