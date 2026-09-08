export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  durationLabel: string;
  src: string;
}

export const PROJECT_PLAYLIST: MediaTrack[] = [
  {
    id: 'five-years',
    title: 'Five Years',
    artist: 'David Bowie',
    durationLabel: '4:43',
    src: new URL('./assets/music/1JIzFhI9Lt5FyslawmHCBi.mp3', import.meta.url).toString(),
  },
  {
    id: 'freaks',
    title: 'Freaks',
    artist: 'Surf Curse',
    durationLabel: '2:27',
    src: new URL('./assets/music/1gl0S9pS0Zw0qfa14rDD3D.mp3', import.meta.url).toString(),
  },
  {
    id: 'washing-machine-heart',
    title: 'Washing Machine Heart',
    artist: 'Mitski',
    durationLabel: '2:08',
    src: new URL('./assets/music/3jjsRKEsF42ccXf8kWR3nu.mp3', import.meta.url).toString(),
  },
];
