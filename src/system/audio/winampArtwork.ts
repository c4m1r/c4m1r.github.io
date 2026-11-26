// Read embedded raster covers without loading the entire audio file into memory.
const MAX_TAG = 16 * 1024 * 1024;
const MAX_IMAGE = 8 * 1024 * 1024;
const ascii = (bytes: Uint8Array) => String.fromCharCode(...bytes);
const u32 = (b: Uint8Array, p: number) => new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(p);
const sync = (b: Uint8Array, p: number) => (b[p] & 127) * 2097152 + (b[p+1] & 127) * 16384 + (b[p+2] & 127) * 128 + (b[p+3] & 127);
function unsync(b: Uint8Array): Uint8Array {
  const out = new Uint8Array(b.length);
  let n = 0;
  for (let i = 0; i < b.length; i++) {
    out[n++] = b[i];
    if (b[i] === 255 && b[i+1] === 0) i++;
  }
  return out.subarray(0, n);
}
function raster(b: Uint8Array): Blob | null {
  if (b.length < 12 || b.length > MAX_IMAGE) return null;
  const type = b[0] === 255 && b[1] === 216 && b[2] === 255 ? 'image/jpeg'
    : ascii(b.subarray(0,8)) === '\x89PNG\r\n\x1a\n' ? 'image/png'
    : ascii(b.subarray(0,3)) === 'GIF' ? 'image/gif'
    : ascii(b.subarray(0,4)) === 'RIFF' && ascii(b.subarray(8,12)) === 'WEBP' ? 'image/webp' : '';
  return type ? new Blob([new Uint8Array(b)], { type }) : null;
}
function id3(b: Uint8Array): Blob | null {
  if (b.length < 10 || ascii(b.subarray(0,3)) !== 'ID3') return null;
  const v = b[3], flags = b[5];
  if (v < 2 || v > 4 || (v === 2 && (flags & 64))) return null;
  let tag = b.subarray(10, Math.min(b.length, 10 + sync(b,6)));
  if (v < 4 && flags & 128) tag = unsync(tag);
  let p = 0;
  if (v >= 3 && flags & 64) {
    if (tag.length < 4) return null;
    p = v === 3 ? 4 + u32(tag,0) : sync(tag,0);
  }
  let fallback: Blob | null = null;
  const h = v === 2 ? 6 : 10;
  while (p + h <= tag.length) {
    const name = ascii(tag.subarray(p,p+(v===2?3:4)));
    const n = v === 2 ? tag[p+3]*65536+tag[p+4]*256+tag[p+5] : v === 4 ? sync(tag,p+4) : u32(tag,p+4);
    if (!n || p+h+n > tag.length) break;
    const f = v === 2 ? 0 : tag[p+9];
    let frame = tag.subarray(p+h,p+h+n);
    p += h+n;
    if (name !== 'APIC' && name !== 'PIC') continue;
    if ((v===3 && f&192) || (v===4 && f&12)) continue;
    if (v===3 && f&32 || v===4 && f&64) frame = frame.subarray(1);
    if (v===4 && f&1) frame = frame.subarray(4);
    if (v===4 && (f&2 || flags&128)) frame = unsync(frame);
    const encoding = frame[0];
    let q = v===2 ? 4 : frame.indexOf(0,1)+1;
    if (q < 1 || q >= frame.length) continue;
    const pictureType = frame[q++];
    const step = encoding===1 || encoding===2 ? 2 : 1;
    while (q+step <= frame.length && !(frame[q]===0 && (step===1 || frame[q+1]===0))) q+=step;
    const image = raster(frame.subarray(q+step));
    if (image && pictureType===3) return image;
    if (image && !fallback) fallback=image;
  }
  return fallback;
}
function flac(b: Uint8Array): Blob | null {
  if (ascii(b.subarray(0,4)) !== 'fLaC') return null;
  let p = 4;
  let fallback: Blob | null = null;
  while (p+4 <= b.length) {
    const flags=b[p], n=b[p+1]*65536+b[p+2]*256+b[p+3];
    const end=p+4+n;
    if (end>b.length) break;
    if ((flags&127)===6 && n>=32) {
      let q=p+4;
      const kind=u32(b,q); q+=4;
      const mime=u32(b,q); q+=4+mime;
      if(q+4<=end) {
        const desc=u32(b,q); q+=4+desc;
        q+=16;
        if(q+4<=end) {
          const length=u32(b,q); q+=4;
          if(q+length<=end) {
            const cover=raster(b.subarray(q,q+length));
            if(cover && kind===3) return cover;
            if(cover && !fallback) fallback=cover;
          }
        }
      }
    }
    p=end;
    if(flags&128) break;
  }
  return fallback;
}
function mp4(b: Uint8Array): Blob | null {
  // Search for a complete covr/data atom, including metadata stored at EOF.
  for(let p=4;p+12<=b.length;p++) {
    if(b[p]!==99 || b[p+1]!==111 || b[p+2]!==118 || b[p+3]!==114) continue;
    const end=p-4+u32(b,p-4);
    if(end>b.length || end<p+20) continue;
    let q=p+4;
    while(q+16<=end) {
      const n=u32(b,q);
      if(n<16 || q+n>end) break;
      if(ascii(b.subarray(q+4,q+8))==='data') {
        const cover=raster(b.subarray(q+16,q+n));
        if(cover) return cover;
      }
      q+=n;
    }
  }
  return null;
}
export async function readEmbeddedAudioArtwork(file: Blob): Promise<Blob | null> {
  const head=new Uint8Array(await file.slice(0,MAX_TAG).arrayBuffer());
  return id3(head) ?? flac(head) ?? mp4(head) ?? (file.size>MAX_TAG && (ascii(head.subarray(4,8))==='ftyp' || file.type.includes('mp4') || file.type.includes('m4a')) ? mp4(new Uint8Array(await file.slice(-MAX_TAG).arrayBuffer())) : null);
}
