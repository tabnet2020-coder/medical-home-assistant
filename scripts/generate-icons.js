import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Create a minimal valid uncompressed/compressed PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdr = makeChunk('IHDR', ihdrData);
  
  // Raw scanlines: each scanline starts with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Squircle distance formula: (x/a)^4 + (y/b)^4 <= 1
      const nx = (x - width / 2) / (width * 0.44);
      const ny = (y - height / 2) / (height * 0.44);
      const isInside = (nx * nx * nx * nx + ny * ny * ny * ny) <= 1.0;
      
      const gradT = y / height;
      // Gradient from emerald (#059669 -> 5, 150, 105) to turquoise (#0e7490 -> 14, 116, 144) to navy (#0f172a -> 15, 23, 42)
      let bgR = Math.round(5 * (1 - gradT) + 15 * gradT);
      let bgG = Math.round(150 * (1 - gradT * 0.8) + 23 * (gradT * 0.8));
      let bgB = Math.round(105 * (1 - gradT) + 42 * gradT);

      // Heart / Capsule center pattern
      const dx = (x - width / 2);
      const dy = (y - height / 2.1);
      const distCenter = Math.sqrt(dx * dx + dy * dy);

      if (isInside) {
        if (distCenter < width * 0.22) {
          // Medical White/Mint emblem
          rawData[pixelOffset] = 255;
          rawData[pixelOffset + 1] = 255;
          rawData[pixelOffset + 2] = 255;
          rawData[pixelOffset + 3] = 255;
        } else {
          rawData[pixelOffset] = bgR;
          rawData[pixelOffset + 1] = bgG;
          rawData[pixelOffset + 2] = bgB;
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        // Transparent exterior
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Emerald / Medical Brand PNGs
const pwa192 = createSolidPNG(192, 192, 255, 255, 255);
const pwa512 = createSolidPNG(512, 512, 255, 255, 255);
const pwaMaskable = createSolidPNG(512, 512, 13, 148, 136);
const appleTouch = createSolidPNG(180, 180, 255, 255, 255);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

const distDir = path.resolve('dist');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'pwa-192x192.png'), pwa192);
  fs.writeFileSync(path.join(distDir, 'pwa-512x512.png'), pwa512);
  fs.writeFileSync(path.join(distDir, 'pwa-maskable-512x512.png'), pwaMaskable);
  fs.writeFileSync(path.join(distDir, 'apple-touch-icon.png'), appleTouch);
}

console.log('Icons generated successfully in public/ and dist/');
