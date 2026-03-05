export interface Track {
  id: string;
  title: string;
  audioUrl: string | null;
  duration: number;
  coverUrl?: string | null;
  gradientFrom?: string;
  gradientTo?: string;
  albumTitle?: string;
}

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused';
export type RepeatMode = 'off' | 'one' | 'all';

type Listener = () => void;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class AudioPlayer {
  // Single persistent element — iOS grants background playback permission to the
  // element on first user-gesture play. Creating a new element per track loses that
  // permission, causing lock-screen next/prev to silently fail.
  private audio: HTMLAudioElement | null = null;
  private _switching = false; // suppress pause event fired during src swap

  private _state: PlayerState = 'idle';
  private _currentTrack: Track | null = null;
  private _queue: Track[] = [];
  private _originalQueue: Track[] = [];
  private _queueIndex: number = -1;
  private _volume: number = 0.8;
  private _currentTime: number = 0;
  private _duration: number = 0;
  private _shuffle: boolean = false;
  private _repeat: RepeatMode = 'off';
  private _listeners: Set<Listener> = new Set();
  private _timeInterval: ReturnType<typeof setInterval> | null = null;

  get state() { return this._state; }
  get currentTrack() { return this._currentTrack; }
  get queue() { return this._queue; }
  get queueIndex() { return this._queueIndex; }
  get volume() { return this._volume; }
  get currentTime() { return this._currentTime; }
  get duration() { return this._duration; }
  get shuffle() { return this._shuffle; }
  get repeat() { return this._repeat; }

  subscribe(listener: Listener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private notify() {
    this._listeners.forEach(l => l());
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      const audio = new Audio();
      audio.volume = this._volume;
      audio.preload = 'auto';

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
          this._duration = audio.duration;
          this.notify();
        }
      });
      audio.addEventListener('timeupdate', () => {
        this._currentTime = audio.currentTime;
        this.notify();
      });
      audio.addEventListener('play', () => {
        this._state = 'playing';
        this.notify();
      });
      audio.addEventListener('pause', () => {
        if (this._switching) return; // src swap in progress, not a real pause
        if (this._state === 'playing') {
          this._state = 'paused';
          this.notify();
        }
      });
      audio.addEventListener('ended', () => {
        this.next();
      });
      audio.addEventListener('error', () => {
        if (this._switching) return;
        this._state = 'paused';
        this._currentTime = 0;
        this.notify();
      });

      this.audio = audio;
    }
    return this.audio;
  }

  private stopInterval() {
    if (this._timeInterval) {
      clearInterval(this._timeInterval);
      this._timeInterval = null;
    }
  }

  private setupMediaSession(track: Track) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'Scott Forsey',
      album: track.albumTitle ?? '',
      artwork: track.coverUrl ? [{ src: track.coverUrl }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => this.resume());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
    navigator.mediaSession.setActionHandler('seekto', (d) => {
      if (d.seekTime != null) this.seek(d.seekTime);
    });
    // Disable default ±15s seek buttons so iOS lock screen shows prev/next
    try { navigator.mediaSession.setActionHandler('seekforward', null); } catch {}
    try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch {}
  }

  play(track: Track) {
    this.stopInterval();
    this._currentTrack = track;
    this._currentTime = 0;
    this._duration = track.duration;
    this.setupMediaSession(track);

    if (!track.audioUrl) {
      // No audio file — pause real audio if playing and simulate progress
      if (this.audio) {
        this._switching = true;
        this.audio.pause();
        this.audio.src = '';
        this._switching = false;
      }
      this._state = 'playing';
      this.notify();
      this._timeInterval = setInterval(() => {
        this._currentTime += 0.25;
        if (this._currentTime >= this._duration) {
          this.stopInterval();
          this.next();
        } else {
          this.notify();
        }
      }, 250);
      return;
    }

    this._state = 'loading';
    this.notify();

    const audio = this.getAudio();
    this._switching = true;
    audio.pause();
    audio.src = track.audioUrl;
    this._switching = false;

    audio.play().catch(() => {
      this._state = 'paused';
      this.notify();
    });
  }

  pause() {
    if (this._state !== 'playing') return;
    this.audio?.pause();
    this._state = 'paused';
    this.notify();
  }

  resume() {
    if (this._state !== 'paused') return;
    this.audio?.play().catch(() => {});
    this._state = 'playing';
    this.notify();
  }

  togglePlayPause() {
    if (this._state === 'playing') this.pause();
    else if (this._state === 'paused') this.resume();
    else if (this._state === 'loading' && this.audio) this.audio.play().catch(() => {});
  }

  seek(time: number) {
    this._currentTime = time;
    if (this.audio) this.audio.currentTime = time;
    this.notify();
  }

  setVolume(vol: number) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this.audio) this.audio.volume = this._volume;
    this.notify();
  }

  playQueue(tracks: Track[], startIndex: number = 0) {
    this._originalQueue = tracks;
    if (this._shuffle) {
      this._queue = shuffleArray(tracks);
      this._queueIndex = 0;
    } else {
      this._queue = tracks;
      this._queueIndex = startIndex;
    }
    const track = this._queue[this._queueIndex];
    if (track) this.play(track);
  }

  addToQueue(track: Track) {
    this._originalQueue.push(track);
    this._queue.push(track);
    if (this._state === 'idle') {
      this._queueIndex = this._queue.length - 1;
      this.play(track);
    }
    this.notify();
  }

  playNext(track: Track) {
    const at = this._queueIndex + 1;
    this._queue.splice(at, 0, track);
    this._originalQueue = [...this._queue];
    if (this._state === 'idle') {
      this._queueIndex = 0;
      this.play(this._queue[0]);
    }
    this.notify();
  }

  removeFromQueue(index: number) {
    if (index < 0 || index >= this._queue.length) return;
    if (index === this._queueIndex) return;
    this._queue.splice(index, 1);
    this._originalQueue = [...this._queue];
    if (index < this._queueIndex) this._queueIndex--;
    this.notify();
  }

  playAt(index: number) {
    if (index < 0 || index >= this._queue.length) return;
    this._queueIndex = index;
    this.play(this._queue[index]);
  }

  clearQueue() {
    const current = this._currentTrack;
    if (current && this._state !== 'idle') {
      this._queue = [current];
      this._originalQueue = [current];
      this._queueIndex = 0;
    } else {
      this._queue = [];
      this._originalQueue = [];
      this._queueIndex = -1;
    }
    this.notify();
  }

  next() {
    if (this._repeat === 'one') {
      this.seek(0);
      if (this._state === 'paused') this.resume();
      else if (this._currentTrack) this.play(this._currentTrack);
      return;
    }

    if (this._queueIndex < this._queue.length - 1) {
      this._queueIndex++;
      this.play(this._queue[this._queueIndex]);
    } else if (this._repeat === 'all' && this._queue.length > 0) {
      if (this._shuffle) this._queue = shuffleArray(this._originalQueue);
      this._queueIndex = 0;
      this.play(this._queue[0]);
    } else {
      this.stopInterval();
      if (this.audio) {
        this._switching = true;
        this.audio.pause();
        this.audio.src = '';
        this._switching = false;
      }
      this._state = 'idle';
      this._currentTrack = null;
      this._currentTime = 0;
      this.notify();
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    }
  }

  previous() {
    if (this._currentTime > 3) {
      this.seek(0);
      if (this._state === 'paused') this.resume();
    } else if (this._queueIndex > 0) {
      this._queueIndex--;
      this.play(this._queue[this._queueIndex]);
    } else {
      this.seek(0);
    }
  }

  toggleShuffle() {
    this._shuffle = !this._shuffle;
    if (this._queue.length === 0) { this.notify(); return; }
    const current = this._currentTrack;
    if (this._shuffle) {
      const rest = this._originalQueue.filter(t => t.id !== current?.id);
      this._queue = current ? [current, ...shuffleArray(rest)] : shuffleArray(this._originalQueue);
      this._queueIndex = 0;
    } else {
      this._queue = [...this._originalQueue];
      const idx = this._originalQueue.findIndex(t => t.id === current?.id);
      this._queueIndex = idx >= 0 ? idx : 0;
    }
    this.notify();
  }

  toggleRepeat() {
    if (this._repeat === 'off') this._repeat = 'all';
    else if (this._repeat === 'all') this._repeat = 'one';
    else this._repeat = 'off';
    this.notify();
  }
}

export const audioPlayer = new AudioPlayer();
