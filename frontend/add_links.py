import json
import re
import urllib.parse
import sys

with open('src/data/plantopedia_data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const PLANTOPEDIA_DATA: any = (\{.*?\});\s*$', text, re.DOTALL)
if not match:
    print("Failed to find JSON data")
    sys.exit(1)

json_str = match.group(1)
data = json.loads(json_str)

index = 1
for category, items in data.items():
    for item in items:
        # Use loremflickr to get an agricultural theme
        cat_kw = "agriculture"
        if "Disease" in category:
            cat_kw = "leaf"
        elif "Fruit" in category:
            cat_kw = "fruit"
        elif "Vegetable" in category:
            cat_kw = "vegetable"
            
        # Add the first word of the plant name to make it more specific
        name_kw = urllib.parse.quote(item["name"].split()[0])
        
        # We add lock=index to provide an id that gets a consistent image
        url = f"https://loremflickr.com/400/300/{cat_kw},{name_kw}/all?lock={index}"
        item['image'] = url
        index += 1

new_json = json.dumps(data, indent=4)
new_text = text[:match.start(1)] + new_json + ";\n"

with open('src/data/plantopedia_data.ts', 'w', encoding='utf-8') as f:
    f.write(new_text)

print(f"Updated {index - 1} items with loremflickr online links")
