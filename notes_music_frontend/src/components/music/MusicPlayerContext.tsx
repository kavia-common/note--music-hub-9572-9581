import { createContextId, useContextProvider, useSignal, type Signal, component$, $ } from '@builder.io/qwik';

/**
 * Describes a single music track
 */
export type Track = {
  id: number;
  title: string;
  artist: string;
  url: string;
  duration: number; // seconds
};

type ContextType = {
  track: Signal<Track|undefined>;
  playing: Signal<boolean>;
  progress: Signal<number>;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setProgress: (val: number, jump: boolean) => void;
  setTrackList: (tracks: Track[], startIdx?: number) => void;
  // etc.
};

// Use Context for music player state
export const MusicPlayerContext = createContextId<ContextType>('music-player-context');

// PUBLIC_INTERFACE
export const MusicPlayerProvider = component$((props: { children?: any }) => {
  // Player state
  const tracks: Track[] = [ // demo tracks, in real use get from backend/db/music files
    { id: 1, title: 'Demo Track 1', artist: 'Unknown', url: '/assets/track1.mp3', duration: 162 },
    { id: 2, title: 'Demo Track 2', artist: 'Artist', url: '/assets/track2.mp3', duration: 149 },
  ];
  const track = useSignal<Track|undefined>(tracks[0]);
  const playing = useSignal(false);
  const progress = useSignal(0);
  // Remove unused let trackIdx
  let audioRef: HTMLAudioElement|undefined = undefined;

  // Set up basic player actions as serializable fn (Qwik $)
  const play = $(function () {
    if (!audioRef) audioRef = getAudioElement();
    if (audioRef) { audioRef.play(); playing.value = true; }
  });
  const pause = $(function () {
    if (!audioRef) audioRef = getAudioElement();
    if (audioRef) { audioRef.pause(); playing.value = false; }
  });
  const next = $(function () {
    const idx = tracks.findIndex(t => t.id === track.value?.id);
    const nextIdx = idx < tracks.length - 1 ? idx + 1 : 0;
    track.value = tracks[nextIdx];
    progress.value = 0;
    if (playing.value) setTimeout(() => play(), 0);
  });
  const previous = $(function () {
    const idx = tracks.findIndex(t => t.id === track.value?.id);
    const prevIdx = idx > 0 ? idx - 1 : tracks.length - 1;
    track.value = tracks[prevIdx];
    progress.value = 0;
    if (playing.value) setTimeout(() => play(), 0);
  });

  const setProgress = $((val: number, jump = false) => {
    progress.value = val;
    if (audioRef && jump) {
      audioRef.currentTime = val;
    }
  });
  const setTrackList = $((_tracks: Track[], start?: number) => {
    // TODO: Replace demo with backend tracks, playlist support
    // For now, just reset demo list
    progress.value = 0;
    track.value = _tracks[start || 0];
  });

  function getAudioElement(): HTMLAudioElement|undefined {
    const el = document.getElementById('global-music-audio') as HTMLAudioElement | null;
    return el || undefined;
  }

  // Expose the context
  useContextProvider(MusicPlayerContext, {
    track, playing, progress,
    play, pause, next, previous,
    setProgress, setTrackList
  });
  return (
    <>
      <audio
        id="global-music-audio"
        src={track.value?.url}
        style={{display:'none'}}
        onTimeUpdate$={$((e: any) => {
          progress.value = Math.floor(e.target.currentTime);
        })}
        onEnded$={next}
      />
      {props.children}
    </>
  );
});
