import fs from 'fs';
import path from 'path';

const dataPath = './src/data/plantopedia_data.ts';
const dataStr = fs.readFileSync(dataPath, 'utf8');

// Use a simple regex to parse the plantopedia data
const match = dataStr.match(/export const PLANTOPEDIA_DATA: any = (\{[\s\S]*?\});?\s*$/);
if (!match) {
    console.error("Could not parse file.");
    process.exit(1);
}

let data;
try {
    data = eval('(' + match[1] + ')');
} catch (e) {
    console.error("Eval failed:", e);
    process.exit(1);
}

let total = 0;
let missing = 0;
let toFetch = [];

for (const [category, items] of Object.entries(data)) {
    for (const item of items) {
        total++;
        const filename = item.name.toLowerCase().replace(/ /g, '_') + '.png';
        const imgPath = `/demo/${filename}`;
        
        // If the item doesn't have an image field, or the file doesn't exist, we need it.
        if (!item.image) {
            item.image = imgPath;
            missing++;
        }
        
        if (!fs.existsSync(`./public/demo/${filename}`)) {
            toFetch.push({ name: item.name, category, filename });
        }
    }
}

console.log(`Total items: ${total}. Missing image fields: ${missing}. To fetch: ${toFetch.length}`);

// Don't actually fetch here, let's just see how many we need:
console.log(JSON.stringify(toFetch.slice(0, 5), null, 2));

const newDataStr = "export const PLANTOPEDIA_DATA: any = " + JSON.stringify(data, null, 4) + ";\n";
fs.writeFileSync(dataPath, newDataStr);
console.log("Updated plantopedia_data.ts with image paths.");
