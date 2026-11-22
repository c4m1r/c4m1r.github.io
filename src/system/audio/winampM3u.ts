import type { MediaTrack } from '../../apps/mediaplayer/playlist';

export interface ParsedM3uPlaylist {
  tracks: MediaTrack[];
  skippedEntries: number;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function makeTrackId(src: string, index: number, prefix: string): string {
  let hash = 2166136261;
  for (let i = 0; i < src.length; i += 1) {
    hash ^= src.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `m3u-${prefix}-${index}-${(hash >>> 0).toString(36)}`;
}

export function parseM3uPlaylist(content: string): ParsedM3uPlaylist {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.some((line) => line.trim().toUpperCase().startsWith('#EXT-X-'))) {
    throw new Error('HLS streaming manifests are not supported as audio playlists.');
  }

  const tracks: MediaTrack[] = [];
  let pendingInfo: { duration: number; label: string } | null = null;
  let skippedEntries = 0;
  const prefix = Date.now().toString(36);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF:')) {
      const match = line.match(/^#EXTINF:\s*(-?\d+(?:\.\d+)?),(.*)$/i);
      pendingInfo = match
        ? { duration: Number(match[1]), label: match[2].trim() }
        : { duration: -1, label: '' };
      continue;
    }
    if (line.startsWith('#')) continue;

    let url: URL;
    try {
      url = new URL(line);
    } catch {
      skippedEntries += 1;
      pendingInfo = null;
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      skippedEntries += 1;
      pendingInfo = null;
      continue;
    }

    const label = pendingInfo?.label ?? '';
    const separator = label.indexOf(' - ');
    let fallbackTitle = url.pathname.split('/').pop() || 'Untitled track';
    try { fallbackTitle = decodeURIComponent(fallbackTitle); } catch { /* Keep the encoded URL segment as a safe title. */ }
    const title = separator >= 0 ? label.slice(separator + 3).trim() : label || fallbackTitle;
    const artist = separator >= 0 ? label.slice(0, separator).trim() : 'Unknown artist';
    const duration = pendingInfo?.duration ?? -1;
    tracks.push({
      id: makeTrackId(url.href, tracks.length, prefix),
      title: title || 'Untitled track',
      artist: artist || 'Unknown artist',
      durationLabel: duration >= 0 ? formatDuration(duration) : '—',
      src: url.href,
    });
    pendingInfo = null;
  }

  return { tracks, skippedEntries };
}

export function createM3uPlaylist(tracks: MediaTrack[]): { content: string; skippedEntries: number } {
  const lines = ['#EXTM3U'];
  let skippedEntries = 0;
  tracks.forEach((track) => {
    let url: URL;
    try {
      url = new URL(track.src);
    } catch {
      skippedEntries += 1;
      return;
    }
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.protocol === 'blob:') {
      skippedEntries += 1;
      return;
    }
    const [minutes, seconds] = track.durationLabel.split(':').map(Number);
    const duration = Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : -1;
    lines.push(`#EXTINF:${duration},${track.artist} - ${track.title}`);
    lines.push(url.href);
  });
  return { content: `${lines.join('\n')}\n`, skippedEntries };
}
