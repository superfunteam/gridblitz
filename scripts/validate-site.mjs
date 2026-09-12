import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import sharp from 'sharp';
const html=await readFile('dist/index.html','utf8');
const origin='https://gridblitz.superfun.games';
const tags=[...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(([tag])=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([,key,value])=>[key,value])));
const meta=name=>tags.find(tag=>tag.name===name||tag.property===name)?.content;
assert.equal(tags.find(tag=>tag.rel==='canonical')?.href,`${origin}/`);
for(const name of ['description','application-name','theme-color','og:title','og:description','og:image:alt','twitter:title','twitter:description','twitter:image:alt'])assert.ok(meta(name),`Missing ${name}`);
assert.equal(meta('og:url'),`${origin}/`);
assert.equal(meta('og:image'),`${origin}/og-image.png`);
assert.equal(meta('twitter:image'),meta('og:image'));
assert.equal(meta('twitter:card'),'summary_large_image');
assert.equal(meta('theme-color'),'#d4fa44');
assert.ok(html.includes('<html lang="en">'));
for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(url.startsWith('data:')||url.startsWith('#')||url==='/')continue;
  const parsed=new URL(url,origin);
  if(parsed.origin===origin)await access(`dist${parsed.pathname}`);
}
const manifest=JSON.parse(await readFile('dist/site.webmanifest','utf8'));
assert.equal(manifest.name,'Grid Blitz');
assert.equal(manifest.id,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.start_url,'/');
assert.equal(manifest.display,'standalone');assert.equal(manifest.theme_color,meta('theme-color'));
assert.ok(manifest.icons.some(icon=>icon.purpose==='maskable'));
for(const icon of manifest.icons){const info=await sharp(`dist${icon.src}`).metadata();assert.equal(`${info.width}x${info.height}`,icon.sizes);}
for(const [path,width,height] of [['og-image.png',1200,630],['apple-touch-icon.png',180,180],['favicon-16x16.png',16,16],['favicon-32x32.png',32,32],['favicon-48x48.png',48,48],['icons/mstile-150.png',150,150]]){
  const info=await sharp(`dist/${path}`).metadata();assert.equal(info.width,width,path);assert.equal(info.height,height,path);assert.equal(info.format,'png');
}
const ico=await readFile('dist/favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),4);
assert.ok((await readFile('dist/robots.txt','utf8')).includes(`${origin}/sitemap.xml`));
assert.ok((await readFile('dist/sitemap.xml','utf8')).includes(`${origin}/`));
console.log('Metadata, canonical URLs, social image, manifest, favicon, and touch icons verified.');
