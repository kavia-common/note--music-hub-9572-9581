import { component$, useContext, $ } from '@builder.io/qwik';
import { MusicPlayerContext } from './music/MusicPlayerContext';

/**
 * Persistent player bar showing current track and audio controls.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  const { track, playing, play, pause, next, previous, progress, setProgress } = useContext(MusicPlayerContext);

  return (
    <footer class="music-player-bar">
      <div class="music-player-controls">
        <button onClick$={previous} aria-label="Previous">&#9198;</button>
        <button
          onClick$={() => {
            if (playing.value) { pause(); }
            else { play(); }
          }}
          aria-label={playing.value ? "Pause" : "Play"}
        >
          {playing.value ? '⏸' : '▶️'}
        </button>
        <button onClick$={next} aria-label="Next">&#9197;</button>
      </div>
      <div class="player-track-info">
        <div class="player-track-title">{track.value?.title || 'No track selected'}</div>
        <div class="player-track-artist">{track.value?.artist || ''}</div>
      </div>
      {/* Progress bar - controlled for seeking */}
      <input
        class="player-progress"
        type="range"
        min={0}
        max={track.value?.duration || 1}
        value={progress.value}
        onInput$={(e: any) => {
          const val = parseFloat(e.target.value);
          setProgress(val, true);
        }}
        onChange$={(e: any) => {
          const val = parseFloat(e.target.value);
          setProgress(val, false);
        }}
        disabled={!track.value}
      />
      <span style={{minWidth:'76px', textAlign: 'right', fontSize:'0.95em', color:'var(--secondary-color)'}}>
        {track.value ? (
          <>
            {formatTime(progress.value)} / {formatTime(track.value.duration)}
          </>
        ) : (
          '--:-- / --:--'
        )}
      </span>
    </footer>
  );
});

// Helper for formatting seconds to 00:00
function formatTime(time: number|undefined) {
  if (!time && time !== 0) return "--:--";
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
}
