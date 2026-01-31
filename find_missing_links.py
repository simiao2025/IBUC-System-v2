import os
import re

search_dir = r'c:\Projetos\IBUC-System-v2\src'
usage_pattern = re.compile(r'<Link\b')
import_pattern = re.compile(r'import\s+.*Link.*from\s+[\'"]react-router-dom[\'"]')

def scan_files():
    for root, dirs, files in os.walk(search_dir):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if usage_pattern.search(content):
                            if not import_pattern.search(content):
                                print(f"MISSING_LINK_IMPORT: {path}")
                except Exception as e:
                    print(f"Error reading {path}: {e}")

if __name__ == "__main__":
    scan_files()
