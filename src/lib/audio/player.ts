export interface Track {
  id: string;
  title: string;
  audioUrl: string | null;
  duration: number;
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
  private audio: HTMLAudioElement | null = null;
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
  // Simulate progress for tracks with no audio URL
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

  private destroyAudio() {
    if (this._timeInterval) {
      clearInterval(this._timeInterval);
      this._timeInterval = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  play(track: Track) {
    this.destroyAudio();
    this._currentTrack = track;
    this._currentTime = 0;
    this._duration = track.duration;

    if (!track.audioUrl) {
      // No audio file — simulate timed progress
      this._state = 'playing';
      this.notify();
      this._timeInterval = setInterval(() => {
        this._currentTime += 0.25;
        if (this._currentTime >= this._duration) {
          clearInterval(this._timeInterval!);
          this._timeInterval = null;
          this.next();
        } else {
          this.notify();
        }
      }, 250);
      return;
    }

    this._state = 'loading';
    this.notify();

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
      if (this._state === 'playing') {
        this._state = 'paused';
        this.notify();
      }
    });

    audio.addEventListener('ended', () => {
      this.next();
    });

    audio.addEventListener('error', () => {
      this._state = 'paused';
      this._currentTime = 0;
      this.notify();
    });

    audio.src = track.audioUrl;
    audio.play().catch(() => {
      // play() rejected — likely before canplay event. Try again on canplay.
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.play().catch(() => {
          this._state = 'paused';
          this.notify();
        });
      };
      audio.addEventListener('canplay', onCanPlay);
    });

    this.audio = audio;
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
      // Fully shuffle — don't anchor startIndex as first track
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
      this.destroyAudio();
      this._state = 'idle';
      this._currentTrack = null;
      this._currentTime = 0;
      this.notify();
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
