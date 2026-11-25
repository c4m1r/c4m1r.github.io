import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/system/audio/winampMetadata.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter((item) => item.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
const { readEmbeddedAudioMetadata } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));

const encoder = new TextEncoder();
const bytes = (...parts) => {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};
const ascii = (value) => Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
const u32le = (value) => Uint8Array.of(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255);
const u32be = (value) => Uint8Array.of((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
const leText = (value) => bytes(u32le(encoder.encode(value).length), encoder.encode(value));
function vorbisComments(comments) {
  return bytes(leText('test-vendor'), u32le(comments.length), ...comments.map(leText));
}
function atom(type, payload) {
  return bytes(u32be(payload.length + 8), Uint8Array.from([...type].map((char) => char.charCodeAt(0))), payload);
}

test('reads ID3v2.3 title, artist, album and track number', async () => {
  const frame = (id, value) => {
    const payload = bytes(Uint8Array.of(3), encoder.encode(value));
    return bytes(ascii(id), u32be(payload.length), Uint8Array.of(0, 0), payload);
  };
  const tag = bytes(frame('TIT2', 'Заголовок'), frame('TPE1', 'Исполнитель'), frame('TALB', 'Альбом'), frame('TRCK', '07/12'));
  const synchsafe = (value) => Uint8Array.of((value >> 21) & 127, (value >> 14) & 127, (value >> 7) & 127, value & 127);
  const file = new Blob([bytes(ascii('ID3'), Uint8Array.of(3, 0, 0), synchsafe(tag.length), tag)]);
  assert.deepEqual(await readEmbeddedAudioMetadata(file), {
    title: 'Заголовок', artist: 'Исполнитель', album: 'Альбом', trackNumber: '07/12',
  });
});

test('reads ID3v2.2 title, artist, album and track number', async () => {
  const frame = (id, value) => {
    const payload = bytes(Uint8Array.of(3), encoder.encode(value));
    const size = payload.length;
    return bytes(ascii(id), Uint8Array.of((size >> 16) & 255, (size >> 8) & 255, size & 255), payload);
  };
  const tag = bytes(frame('TT2', 'Заголовок 2.2'), frame('TP1', 'Исполнитель'), frame('TAL', 'Альбом'), frame('TRK', '08/14'));
  const synchsafe = (value) => Uint8Array.of((value >> 21) & 127, (value >> 14) & 127, (value >> 7) & 127, value & 127);
  const file = new Blob([bytes(ascii('ID3'), Uint8Array.of(2, 0, 0), synchsafe(tag.length), tag)]);
  assert.deepEqual(await readEmbeddedAudioMetadata(file), {
    title: 'Заголовок 2.2', artist: 'Исполнитель', album: 'Альбом', trackNumber: '08/14',
  });
});

test('reads ID3v2.4 synchsafe frame lengths and UTF-16 text frames', async () => {
  const synchsafe = (value) => Uint8Array.of((value >> 21) & 127, (value >> 14) & 127, (value >> 7) & 127, value & 127);
  const utf16 = (value) => {
    const output = new Uint8Array(2 + value.length * 2);
    output.set([0xff, 0xfe]);
    for (let index = 0; index < value.length; index += 1) {
      const codeUnit = value.charCodeAt(index);
      output[2 + index * 2] = codeUnit & 255;
      output[3 + index * 2] = codeUnit >>> 8;
    }
    return output;
  };
  const frame = (id, payload) => bytes(ascii(id), synchsafe(payload.length), Uint8Array.of(0, 0), payload);
  const tag = bytes(
    frame('TIT2', bytes(Uint8Array.of(1), utf16('Музыка 2.4'))),
    frame('TPE1', bytes(Uint8Array.of(3), encoder.encode('Artist 2.4'))),
  );
  const file = new Blob([bytes(ascii('ID3'), Uint8Array.of(4, 0, 0), synchsafe(tag.length), tag)]);
  assert.deepEqual(await readEmbeddedAudioMetadata(file), { title: 'Музыка 2.4', artist: 'Artist 2.4' });
});

test('reads legacy ID3v1 metadata', async () => {
  const field = (value) => {
    const raw = encoder.encode(value);
    const output = new Uint8Array(30);
    output.set(raw.subarray(0, 30));
    return output;
  };
  const comment = new Uint8Array(30);
  comment[29] = 9;
  const tag = bytes(ascii('TAG'), field('Legacy title'), field('Legacy artist'), field('Legacy album'), new Uint8Array(4), comment, Uint8Array.of(0));
  const file = new Blob([new Uint8Array(32), tag]);
  const metadata = await readEmbeddedAudioMetadata(file);
  assert.equal(metadata.title, 'Legacy title');
  assert.equal(metadata.artist, 'Legacy artist');
  assert.equal(metadata.album, 'Legacy album');
  assert.equal(metadata.trackNumber, '9');
});

test('reads FLAC Vorbis comments', async () => {
  const comments = vorbisComments(['TITLE=Flac title', 'ARTIST=Flac artist', 'ALBUM=Flac album', 'TRACKNUMBER=4']);
  const blockHeader = Uint8Array.of(0x84, (comments.length >> 16) & 255, (comments.length >> 8) & 255, comments.length & 255);
  const file = new Blob([bytes(ascii('fLaC'), blockHeader, comments)], { type: 'audio/flac' });
  assert.deepEqual(await readEmbeddedAudioMetadata(file), {
    title: 'Flac title', artist: 'Flac artist', album: 'Flac album', trackNumber: '4',
  });
});

test('reads Ogg Vorbis comments across packet lacing', async () => {
  const packet = bytes(Uint8Array.of(3), ascii('vorbis'), vorbisComments([
    'TITLE=Ogg title', 'ARTIST=Ogg artist', 'ALBUM=Ogg album', 'TRACKNUMBER=11',
  ]));
  const lacing = [];
  let remaining = packet.length;
  while (remaining >= 255) { lacing.push(255); remaining -= 255; }
  lacing.push(remaining);
  const header = new Uint8Array(27 + lacing.length);
  header.set(ascii('OggS'), 0);
  header[26] = lacing.length;
  header.set(lacing, 27);
  const file = new Blob([bytes(header, packet)], { type: 'audio/ogg' });
  assert.deepEqual(await readEmbeddedAudioMetadata(file), {
    title: 'Ogg title', artist: 'Ogg artist', album: 'Ogg album', trackNumber: '11',
  });
});

test('reads WAV LIST/INFO metadata with padded chunks', async () => {
  const infoChunk = (id, value) => {
    const raw = bytes(encoder.encode(value), Uint8Array.of(0));
    return bytes(ascii(id), u32le(raw.length), raw, raw.length % 2 ? Uint8Array.of(0) : new Uint8Array());
  };
  const info = bytes(ascii('INFO'), infoChunk('INAM', 'WAV title'), infoChunk('IART', 'WAV artist'), infoChunk('IPRD', 'WAV album'), infoChunk('ITRK', '3'));
  const list = bytes(ascii('LIST'), u32le(info.length), info);
  const wav = bytes(ascii('RIFF'), u32le(4 + list.length), ascii('WAVE'), list);
  assert.deepEqual(await readEmbeddedAudioMetadata(new Blob([wav], { type: 'audio/wav' })), {
    title: 'WAV title', artist: 'WAV artist', album: 'WAV album', trackNumber: '3',
  });
});

test('reads MP4/M4A ilst atoms including track number', async () => {
  const data = (value) => atom('data', bytes(Uint8Array.of(0, 0, 0, 1, 0, 0, 0, 0), encoder.encode(value)));
  const trackData = new Uint8Array(16);
  trackData[11] = 6;
  const items = bytes(
    atom('©nam', data('MP4 title')),
    atom('©ART', data('MP4 artist')),
    atom('©alb', data('MP4 album')),
    atom('trkn', atom('data', trackData)),
  );
  const ilst = atom('ilst', items);
  const meta = atom('meta', bytes(Uint8Array.of(0, 0, 0, 0), ilst));
  const moov = atom('moov', atom('udta', meta));
  assert.deepEqual(await readEmbeddedAudioMetadata(new Blob([moov], { type: 'audio/mp4' })), {
    title: 'MP4 title', artist: 'MP4 artist', album: 'MP4 album', trackNumber: '6',
  });
});
