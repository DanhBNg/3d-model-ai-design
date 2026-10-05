import { PARTS } from '../src/models/drone/metadata.js';
import { writeFileSync } from 'node:fs';
writeFileSync('blender/drone/assembly-manifest.json',JSON.stringify(PARTS.map(({id,offset,stage})=>({id,offset,stage})),null,2));
