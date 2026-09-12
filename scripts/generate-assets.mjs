import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('dist/icons', { recursive: true });
const appIcon = 'assets/app-icon.svg';
for (const [size, path] of [[180,'dist/apple-touch-icon.png'],[192,'dist/icons/icon-192.png'],[512,'dist/icons/icon-512.png'],[512,'dist/icons/icon-maskable-512.png'],[150,'dist/icons/mstile-150.png']]) {
  await sharp(appIcon).resize(size,size).png().toFile(path);
}
for (const size of [16,32,48]) await sharp('dist/favicon.svg').resize(size,size).png().toFile(`dist/favicon-${size}x${size}.png`);
// ICO entries contain PNG data, supported by modern browsers and Windows.
const sizes=[16,32,48,256];
const pngs=await Promise.all(sizes.map(size=>sharp('dist/favicon.svg').resize(size,size).png().toBuffer()));
const directory=Buffer.alloc(6+16*sizes.length);directory.writeUInt16LE(1,2);directory.writeUInt16LE(sizes.length,4);
let offset=directory.length;
sizes.forEach((size,i)=>{const entry=6+i*16;directory[entry]=size===256?0:size;directory[entry+1]=size===256?0:size;directory.writeUInt16LE(1,entry+4);directory.writeUInt16LE(32,entry+6);directory.writeUInt32LE(pngs[i].length,entry+8);directory.writeUInt32LE(offset,entry+12);offset+=pngs[i].length;});
await writeFile('dist/favicon.ico',Buffer.concat([directory,...pngs]));
await sharp('assets/og-source.png').resize(1200,630,{fit:'cover'}).png({compressionLevel:9}).toFile('dist/og-image.png');
console.log('Generated social card, favicons, touch icon, and app icons.');
