'use client';

import { useState, useEffect, useRef } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { FileButton } from '@/components/ui/FileButton';

const TOKEN_KEY = 'scottforsey_admin_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function AdminPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const checkSession = useAction(api.admin.checkSession);

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setChecking(false);
      return;
    }
    checkSession({ token: stored })
      .then((valid) => {
        if (valid) setToken(stored);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false));
  }, [checkSession]);

  if (checking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-brown-lighter">
        Loading...
      </div>
    );
  }

  if (!token) {
    return <LoginForm onLogin={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brown">Admin</h1>
        <button
          onClick={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }}
          className="text-sm text-brown-lighter active:text-brown"
        >
          Log out
        </button>
      </div>

      <AlbumsSection token={token} />
      <MusicSection token={token} />
      <ArtSection token={token} />
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAction(api.admin.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await login({ password });
      onLogin(token);
    } catch {
      setError('Wrong password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="font-display text-2xl font-bold text-brown text-center mb-6">Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg border border-brown/20 bg-white text-brown focus:outline-none focus:border-sunset"
          autoFocus
        />
        {error && <p className="text-berry text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-sunset text-white font-display font-semibold active:bg-sunset/90 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

function AlbumsSection({ token }: { token: string }) {
  const albums = useQuery(api.albums.listAll, { token });
  const createAlbum = useMutation(api.albums.create);
  const updateAlbum = useMutation(api.albums.update);
  const removeAlbum = useMutation(api.albums.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(null); return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let coverStorageId: Id<"_storage"> | undefined;
      const file = coverFile;
      if (file) {
        const uploadUrl = await generateUploadUrl({ token });
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();
        coverStorageId = storageId;
      }

      await createAlbum({
        token,
        title: title.trim(),
        description: description.trim() || undefined,
        coverStorageId,
      });

      setTitle('');
      setDescription('');
      setCoverFile(null);
    } catch (err) {
      console.error('Failed to create album:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Albums / Playlists</h2>

      {/* Create */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Album title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
        />
        <FileButton
          accept="image/*"
          label="Choose Cover Image"
          selectedName={coverFile?.name}
          onChange={setCoverFile}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          }
        />
        {coverPreview && (
          <div className="flex items-start gap-3">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-24 h-24 rounded-lg object-cover shadow-sm border border-brown/10"
            />
            <button
              type="button"
              onClick={() => setCoverFile(null)}
              className="text-xs text-brown-lighter active:text-berry mt-1"
            >
              Remove
            </button>
          </div>
        )}
        <button
          onClick={handleCreate}
          disabled={uploading || !title.trim()}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50"
        >
          {uploading ? 'Creating...' : 'Create Album'}
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {albums?.map((album) => (
          <div key={album._id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded bg-parchment flex-shrink-0 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-display font-semibold text-sm truncate ${album.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                {album.title}
              </p>
              {album.description && (
                <p className="text-xs text-brown-lighter truncate">{album.description}</p>
              )}
            </div>
            <button
              onClick={() => updateAlbum({ token, id: album._id as Id<"albums">, isVisible: !album.isVisible })}
              className={`text-xs px-2 py-1 rounded ${album.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}
            >
              {album.isVisible ? 'Visible' : 'Hidden'}
            </button>
            <button
              onClick={() => { if (confirm(`Delete "${album.title}"? Songs will be unassigned.`)) removeAlbum({ token, id: album._id as Id<"albums"> }); }}
              className="text-xs text-berry/60 active:text-berry"
            >
              Delete
            </button>
          </div>
        ))}
        {albums?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No albums yet.</p>
        )}
      </div>
    </section>
  );
}

function MusicSection({ token }: { token: string }) {
  const songs = useQuery(api.songs.listAll, { token });
  const albums = useQuery(api.albums.listAll, { token });
  const createSong = useMutation(api.songs.create);
  const updateSong = useMutation(api.songs.update);
  const removeSong = useMutation(api.songs.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [newSongAlbumId, setNewSongAlbumId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function togglePlay(songId: string, url: string | null) {
    if (!url) return;
    if (playingId === songId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.addEventListener('ended', () => setPlayingId(null));
    audio.play();
    audioRef.current = audio;
    setPlayingId(songId);
  }

  const handleUpload = async () => {
    if (!audioFile || !title.trim()) return;

    setUploading(true);
    try {
      const duration = await getAudioDuration(audioFile);

      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': audioFile.type },
        body: audioFile,
      });
      const { storageId } = await result.json();

      await createSong({
        token,
        title: title.trim(),
        storageId,
        duration: Math.round(duration),
        featured: false,
        albumId: newSongAlbumId ? newSongAlbumId as Id<"albums"> : undefined,
      });

      setTitle('');
      setNewSongAlbumId('');
      setAudioFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  function handleAlbumChange(songId: string, albumId: string) {
    if (albumId === '') {
      updateSong({ token, id: songId as Id<"songs">, clearAlbum: true });
    } else {
      updateSong({ token, id: songId as Id<"songs">, albumId: albumId as Id<"albums"> });
    }
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Music</h2>

      {/* Upload */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <FileButton
          accept="audio/*"
          label="Choose Audio File"
          selectedName={audioFile?.name}
          onChange={setAudioFile}
          onClear={() => setAudioFile(null)}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          }
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
        />
        {albums && albums.length > 0 && (
          <select
            value={newSongAlbumId}
            onChange={(e) => setNewSongAlbumId(e.target.value)}
            className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset bg-white"
          >
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a._id} value={a._id}>{a.title}</option>
            ))}
          </select>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Add Song'}
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {songs?.map((song) => (
          <div key={song._id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
            <button
              onClick={() => togglePlay(song._id, song.url)}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-parchment/60 active:bg-sunset/20"
              aria-label={playingId === song._id ? 'Pause' : 'Play'}
            >
              {playingId === song._id ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-sunset">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-display font-semibold text-sm truncate ${song.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                {song.title}
              </p>
              <p className="text-xs text-brown-lighter">
                {formatDuration(song.duration)}
                {song.featured && ' · Featured'}
              </p>
            </div>
            {albums && albums.length > 0 && (
              <select
                value={(song as any).albumId ?? ''}
                onChange={(e) => handleAlbumChange(song._id, e.target.value)}
                className="text-xs px-2 py-1 rounded border border-brown/20 text-brown bg-white focus:outline-none focus:border-sunset max-w-[110px]"
              >
                <option value="">No album</option>
                {albums.map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => updateSong({ token, id: song._id as Id<"songs">, featured: !song.featured })}
              className={`text-xs px-2 py-1 rounded ${song.featured ? 'bg-lego-yellow text-brown' : 'bg-parchment text-brown-lighter'}`}
            >
              {song.featured ? 'Featured' : 'Feature'}
            </button>
            <button
              onClick={() => updateSong({ token, id: song._id as Id<"songs">, isVisible: !song.isVisible })}
              className={`text-xs px-2 py-1 rounded ${song.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}
            >
              {song.isVisible ? 'Visible' : 'Hidden'}
            </button>
            <button
              onClick={() => { if (confirm('Delete this song?')) removeSong({ token, id: song._id as Id<"songs"> }); }}
              className="text-xs text-berry/60 active:text-berry"
            >
              Delete
            </button>
          </div>
        ))}
        {songs?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No songs yet.</p>
        )}
      </div>
    </section>
  );
}

function ArtSection({ token }: { token: string }) {
  const artworks = useQuery(api.artworks.listAll, { token });
  const createArtwork = useMutation(api.artworks.create);
  const updateArtwork = useMutation(api.artworks.update);
  const removeArtwork = useMutation(api.artworks.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [artFile, setArtFile] = useState<File | null>(null);
  const [artPreview, setArtPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [dimensions, setDimensions] = useState('');
  const [series, setSeries] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!artFile) { setArtPreview(null); return; }
    const url = URL.createObjectURL(artFile);
    setArtPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [artFile]);

  const handleUpload = async () => {
    const file = artFile;
    if (!file || !title.trim() || !medium.trim()) return;

    setUploading(true);
    try {
      const { width, height } = await getImageDimensions(file);

      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await createArtwork({
        token,
        title: title.trim(),
        storageId,
        medium: medium.trim(),
        year: parseInt(year) || new Date().getFullYear(),
        dimensions: dimensions.trim() || `${width}x${height}`,
        series: series.trim() || medium.trim(),
        featured: false,
        aspectRatio: width / height,
        description: description.trim() || undefined,
      });

      setTitle('');
      setMedium('');
      setDimensions('');
      setSeries('');
      setDescription('');
      setArtFile(null); // preview clears via useEffect
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Art</h2>

      {/* Upload */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <FileButton
          accept="image/*"
          label="Choose Image"
          selectedName={artFile?.name}
          onChange={setArtFile}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          }
        />
        {artPreview && (
          <div className="flex items-start gap-3">
            <img
              src={artPreview}
              alt="Artwork preview"
              className="w-24 h-24 rounded-lg object-cover shadow-sm border border-brown/10"
            />
            <button
              type="button"
              onClick={() => setArtFile(null)}
              className="text-xs text-brown-lighter active:text-berry mt-1"
            >
              Remove
            </button>
          </div>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            placeholder="Medium (e.g. Pixel Art)"
            className="flex-1 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
          />
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year"
            className="w-20 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            placeholder="Series (optional)"
            className="flex-1 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
          />
          <input
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="Dimensions (auto)"
            className="flex-1 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
          />
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Add Artwork'}
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {artworks?.map((artwork) => (
          <div key={artwork._id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
            <div className="flex-1 min-w-0">
              <p className={`font-display font-semibold text-sm truncate ${artwork.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                {artwork.title}
              </p>
              <p className="text-xs text-brown-lighter">
                {artwork.medium} · {artwork.year}
                {artwork.featured && ' · Featured'}
              </p>
            </div>
            <button
              onClick={() => updateArtwork({ token, id: artwork._id as Id<"artworks">, featured: !artwork.featured })}
              className={`text-xs px-2 py-1 rounded ${artwork.featured ? 'bg-lego-yellow text-brown' : 'bg-parchment text-brown-lighter'}`}
            >
              {artwork.featured ? 'Featured' : 'Feature'}
            </button>
            <button
              onClick={() => updateArtwork({ token, id: artwork._id as Id<"artworks">, isVisible: !artwork.isVisible })}
              className={`text-xs px-2 py-1 rounded ${artwork.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}
            >
              {artwork.isVisible ? 'Visible' : 'Hidden'}
            </button>
            <button
              onClick={() => { if (confirm('Delete this artwork?')) removeArtwork({ token, id: artwork._id as Id<"artworks"> }); }}
              className="text-xs text-berry/60 active:text-berry"
            >
              Delete
            </button>
          </div>
        ))}
        {artworks?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No artworks yet.</p>
        )}
      </div>
    </section>
  );
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });
    audio.addEventListener('error', reject);
    audio.src = URL.createObjectURL(file);
  });
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
