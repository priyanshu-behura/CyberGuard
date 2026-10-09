import sqlite3
import re

conn = sqlite3.connect(r'C:\Users\Priyanshu Behura\.gemini\antigravity-ide\conversations\b1654711-0ad8-44cd-963e-048f6519282d.db')
cursor = conn.cursor()

# Find all user requests
rows = cursor.execute('SELECT idx, step_type, step_payload FROM steps ORDER BY idx').fetchall()

for idx, stype, payload in rows:
    if not payload:
        continue
    if b'USER_REQUEST' in payload:
        m = re.search(rb'<USER_REQUEST>(.*?)</USER_REQUEST>', payload, re.DOTALL)
        if m:
            print(f'=== STEP {idx} USER_REQUEST ===')
            print(m.group(1).decode('utf-8', errors='ignore').strip())
            print('-' * 40)
    elif stype == 14:
        # User step without tags?
        print(f'=== STEP {idx} (type 14) ===')
        text = ''.join(chr(b) if 32 <= b < 127 or b in (10, 13) else ' ' for b in payload)
        print(text[:300].strip())
        print('-' * 40)
