import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeRoot = path.join(rootDir, 'src', 'themes');
const outputArg = process.argv.indexOf('--json');
const outputPath = outputArg >= 0 ? path.resolve(rootDir, process.argv[outputArg + 1] || 'docs/icon-bank-inventory.json') : null;
const supported = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp']);

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function pngInfo(buffer) {
  if (buffer.length < 26) return {};
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  let paletteTransparency = false;
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'tRNS') paletteTransparency = true;
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  return { width, height, colorType, alpha: colorType === 4 || colorType === 6 || paletteTransparency };
}

function jpegInfo(buffer) {
  let offset = 2;
  while (offset + 4 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5), alpha: false };
    }
    if (length < 2) break;
    offset += 2 + length;
  }
  return {};
}

function gifInfo(buffer) {
  if (buffer.length < 10) return {};
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
    alpha: buffer.indexOf(Buffer.from([0x21, 0xf9, 0x04])) >= 0,
  };
}

function webpInfo(buffer) {
  if (buffer.length < 30) return {};
  let offset = 12;
  let info = {};
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === 'VP8X' && size >= 10) {
      info = {
        width: 1 + readUInt24LE(buffer, data + 4),
        height: 1 + readUInt24LE(buffer, data + 7),
        alpha: (buffer[data] & 0x10) !== 0,
      };
      break;
    }
    if (type === 'VP8L' && size >= 5 && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      info = { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, alpha: ((bits >> 28) & 1) !== 0 };
      break;
    }
    if (type === 'VP8 ' && size >= 10) {
      info = { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff, alpha: false };
      break;
    }
    offset = data + size + (size % 2);
  }
  return info;
}

function svgInfo(buffer) {
  const source = buffer.toString('utf8', 0, Math.min(buffer.length, 8192));
  const tag = source.match(/<svg\\b[^>]*>/i)?.[0] || '';
  const readLength = (name) => {
    const value = tag.match(new RegExp('\\\\b' + name + '=["\\\\']([^"\\\\']+)["\\\\']', 'i'))?.[1];
    const parsed = value ? Number.parseFloat(value) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const viewBox = tag.match(/\\bviewBox=["']([\\d. -]+)["']/i)?.[1]?.trim().split(/[\\s,]+/).map(Number);
  return {
    width: readLength('width') ?? (viewBox?.length === 4 ? viewBox[2] : undefined),
    height: readLength('height') ?? (viewBox?.length === 4 ? viewBox[3] : undefined),
    vector: true,
    alpha: /opacity|fill=["']none["']|fill-opacity/i.test(source),
  };
}

function icoInfo(buffer) {
  if (buffer.length < 22) return {};
  const count = buffer.readUInt16LE(4);
  const variants = [];
  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16;
    if (offset + 16 > buffer.length) break;
    variants.push({
      width: buffer[offset] || 256,
      height: buffer[offset + 1] || 256,
      bitDepth: buffer.readUInt16LE(offset + 6),
    });
  }
  return {
    variants,
    width: Math.max(0, ...variants.map((item) => item.width)),
    height: Math.max(0, ...variants.map((item) => item.height)),
    alpha: variants.some((item) => item.bitDepth >= 32),
  };
}

function inspect(filePath) {
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  let metadata = {};
  if (extension === '.png') metadata = pngInfo(buffer);
  else if (extension === '.jpg' || extension === '.jpeg') metadata = jpegInfo(buffer);
  else if (extension === '.gif') metadata = gifInfo(buffer);
  else if (extension === '.webp') metadata = webpInfo(buffer);
  else if (extension === '.svg') metadata = svgInfo(buffer);
  else if (extension === '.ico') metadata = icoInfo(buffer);
  else if (extension === '.bmp' && buffer.length >= 26) {
    metadata = { width: Math.abs(buffer.readInt32LE(18)), height: Math.abs(buffer.readInt32LE(22)), bitDepth: buffer.readUInt16LE(28), alpha: buffer.readUInt16LE(28) === 32 };
  }
  return {
    path: path.relative(rootDir, filePath).split(path.sep).join('/'),
    format: extension.slice(1),
    bytes: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    ...metadata,
  };
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return supported.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

const files = walk(themeRoot).map(inspect).sort((a, b) => a.path.localeCompare(b.path));
const byHash = new Map();
for (const item of files) {
  const matches = byHash.get(item.sha256) || [];
  matches.push(item.path);
  byHash.set(item.sha256, matches);
}
const duplicates = [...byHash.values()].filter((paths) => paths.length > 1);
const report = {
  generatedAt: new Date().toISOString(),
  root: 'src/themes',
  totalFiles: files.length,
  formats: files.reduce((counts, item) => ({ ...counts, [item.format]: (counts[item.format] || 0) + 1 }), {}),
  files,
  exactDuplicates: duplicates,
};

console.log(`Theme icon inventory: ${report.totalFiles} image files`);
console.log('Formats:', report.formats);
console.log(`Exact duplicate groups: ${duplicates.length}`);
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\\n`);
  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
} else {
  for (const group of duplicates) console.log('Duplicate:', group.join(' | '));
}
