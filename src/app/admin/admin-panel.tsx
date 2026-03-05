'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import NextImage from 'next/image';
import type { Id } from '../../../convex/_generated/dataModel';
import { FileButton } from '@/components/ui/FileButton';
import { AlbumCover } from '@/components/music/AlbumCover';

const TOKEN_KEY = 'scottforsey_admin_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

type AdminTab = 'music' | 'albums' | 'art' | 'site';

export function AdminPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('music');
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

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'music', label: 'Music' },
    { id: 'albums', label: 'Albums' },
    { id: 'art', label: 'Art' },
    { id: 'site', label: 'Site' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-brown">Admin</h1>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-brown-lighter active:text-brown">← View site</a>
          <button
            onClick={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }}
            className="text-sm text-brown-lighter active:text-brown"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-parchment/60 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-brown shadow-sm'
                : 'text-brown-lighter active:text-brown'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'albums' && <AlbumsSection token={token} />}
      {activeTab === 'music' && <MusicSection token={token} />}
      {activeTab === 'art' && <ArtSection token={token} />}
      {activeTab === 'site' && <SiteSection token={token} />}
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

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [gradientFrom, setGradientFrom] = useState('#f4a261');
  const [gradientTo, setGradientTo] = useState('#e76f51');
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [editAlbumType, setEditAlbumType] = useState('album');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!coverFile) { setCoverPreview(null); return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    if (!editCoverFile) { setEditCoverPreview(null); return; }
    const url = URL.createObjectURL(editCoverFile);
    setEditCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editCoverFile]);

  function startEdit(album: any) {
    setEditingId(album._id);
    setEditTitle(album.title);
    setEditDescription(album.description ?? '');
    setEditAlbumType(album.albumType ?? 'album');
    setEditCoverFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditCoverFile(null);
  }

  const handleCreate = async () => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      let coverStorageId: Id<"_storage"> | undefined;
      if (coverFile) {
        const uploadUrl = await generateUploadUrl({ token });
        const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': coverFile.type }, body: coverFile });
        const { storageId } = await result.json();
        coverStorageId = storageId;
      }
      await createAlbum({ token, title: title.trim(), description: description.trim() || undefined, coverStorageId, gradientFrom, gradientTo });
      setTitle('');
      setDescription('');
      setCoverFile(null);
      setGradientFrom('#f4a261');
      setGradientTo('#e76f51');
    } catch (err) {
      console.error('Failed to create album:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (album: any) => {
    setEditSaving(true);
    try {
      let coverStorageId: Id<"_storage"> | undefined;
      if (editCoverFile) {
        const uploadUrl = await generateUploadUrl({ token });
        const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': editCoverFile.type }, body: editCoverFile });
        const { storageId } = await result.json();
        coverStorageId = storageId;
      }
      await updateAlbum({
        token,
        id: album._id as Id<"albums">,
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
        albumType: editAlbumType,
        ...(coverStorageId ? { coverStorageId } : {}),
      });
      setEditingId(null);
      setEditCoverFile(null);
    } catch (err) {
      console.error('Failed to save album:', err);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Albums / Playlists</h2>

      {/* Create */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Album title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        <div className="space-y-2">
          <p className="text-xs text-brown-lighter">Cover gradient (used if no image)</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input type="color" value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border border-brown/20" title="Start color" />
              <span className="text-xs text-brown-lighter">to</span>
              <input type="color" value={gradientTo} onChange={(e) => setGradientTo(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border border-brown/20" title="End color" />
            </div>
            {!coverPreview && (
              <div className="w-12 h-12 rounded-lg shadow-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />
            )}
          </div>
        </div>
        <FileButton accept="image/*" label="Or choose a cover image" selectedName={coverFile?.name} onChange={setCoverFile}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>}
        />
        {coverPreview && (
          <div className="flex items-start gap-3">
            <img src={coverPreview} alt="Cover preview" className="w-24 h-24 rounded-lg object-cover shadow-sm border border-brown/10" />
            <button type="button" onClick={() => setCoverFile(null)} className="text-xs text-brown-lighter active:text-berry mt-1">Remove</button>
          </div>
        )}
        <button onClick={handleCreate} disabled={uploading || !title.trim()}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
          {uploading ? 'Creating...' : 'Create Album'}
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {albums?.map((album) => (
          <div key={album._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {editingId === album._id ? (
              /* Edit form */
              <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-brown-lighter uppercase tracking-wide">Editing album</p>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Album title"
                  className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-brown-lighter">Type</label>
                  <select value={editAlbumType} onChange={(e) => setEditAlbumType(e.target.value)}
                    className="px-2 py-1.5 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset bg-white">
                    <option value="album">Album</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description (optional)"
                  className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                <div className="space-y-1">
                  <p className="text-xs text-brown-lighter">Change cover image</p>
                  <FileButton accept="image/*" label="Choose new cover" selectedName={editCoverFile?.name} onChange={setEditCoverFile}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>}
                  />
                  {editCoverPreview && (
                    <img src={editCoverPreview} alt="New cover" className="w-20 h-20 rounded-lg object-cover shadow-sm border border-brown/10 mt-2" />
                  )}
                  {album.coverUrl && !editCoverFile && (
                    <div className="flex items-center gap-3 mt-2">
                      <img src={album.coverUrl} alt="Current cover" className="w-12 h-12 rounded-lg object-cover shadow-sm border border-brown/10" />
                      <button type="button" onClick={() => updateAlbum({ token, id: album._id as Id<"albums">, clearCover: true })}
                        className="text-xs text-berry/60 active:text-berry">Remove current cover</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(album)} disabled={editSaving}
                    className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-parchment text-brown text-sm active:bg-parchment/70">Cancel</button>
                </div>
              </div>
            ) : (
              /* Normal row */
              <div className="flex items-center gap-3 px-4 py-3">
                <AlbumCover coverUrl={album.coverUrl} gradientFrom={(album as any).gradientFrom} gradientTo={(album as any).gradientTo}
                  title={album.title} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`font-display font-semibold text-sm truncate ${album.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                    {album.title}
                  </p>
                  {album.description && <p className="text-xs text-brown-lighter truncate">{album.description}</p>}
                </div>
                {!album.coverUrl && (
                  <div className="flex items-center gap-1">
                    <input type="color" defaultValue={(album as any).gradientFrom ?? '#f4a261'}
                      onChange={(e) => updateAlbum({ token, id: album._id as Id<"albums">, gradientFrom: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer border border-brown/20" title="Start color" />
                    <input type="color" defaultValue={(album as any).gradientTo ?? '#e76f51'}
                      onChange={(e) => updateAlbum({ token, id: album._id as Id<"albums">, gradientTo: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer border border-brown/20" title="End color" />
                  </div>
                )}
                <button onClick={() => startEdit(album)} className="text-xs px-2 py-1 rounded bg-parchment text-brown-light active:bg-parchment/70">
                  Edit
                </button>
                <button onClick={() => updateAlbum({ token, id: album._id as Id<"albums">, isVisible: !album.isVisible })}
                  className={`text-xs px-2 py-1 rounded ${album.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}>
                  {album.isVisible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => { if (confirm(`Delete "${album.title}"? Songs will be unassigned.`)) removeAlbum({ token, id: album._id as Id<"albums"> }); }}
                  className="text-xs text-berry/60 active:text-berry">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {albums?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No albums yet.</p>
        )}
      </div>
    </section>
  );
}

interface BatchFile {
  file: File;
  title: string;
  albumId: string;
}

function MusicSection({ token }: { token: string }) {
  const songs = useQuery(api.songs.listAll, { token });
  const albums = useQuery(api.albums.listAll, { token });
  const createSong = useMutation(api.songs.create);
  const updateSong = useMutation(api.songs.update);
  const removeSong = useMutation(api.songs.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Single upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [newSongAlbumId, setNewSongAlbumId] = useState('');
  const [uploading, setUploading] = useState(false);

  // Batch upload
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const batchInputId = useId();

  // Song search
  const [songSearch, setSongSearch] = useState('');

  // Song editing
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editingSongTitle, setEditingSongTitle] = useState('');

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

  function handleBatchSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setBatchFiles(files.map((f) => ({
      file: f,
      title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      albumId: '',
    })));
    e.target.value = '';
  }

  const handleUpload = async () => {
    if (!audioFile || !title.trim()) return;
    setUploading(true);
    try {
      const duration = await getAudioDuration(audioFile);
      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': audioFile.type }, body: audioFile });
      const { storageId } = await result.json();
      await createSong({ token, title: title.trim(), storageId, duration: Math.round(duration), featured: false, albumId: newSongAlbumId ? newSongAlbumId as Id<"albums"> : undefined });
      setTitle('');
      setNewSongAlbumId('');
      setAudioFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    setBatchUploading(true);
    setBatchProgress(0);
    for (let i = 0; i < batchFiles.length; i++) {
      const { file, title: t, albumId } = batchFiles[i];
      try {
        const duration = await getAudioDuration(file);
        const uploadUrl = await generateUploadUrl({ token });
        const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const { storageId } = await result.json();
        await createSong({ token, title: t.trim() || file.name, storageId, duration: Math.round(duration), featured: false, albumId: albumId ? albumId as Id<"albums"> : undefined });
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
      setBatchProgress(i + 1);
    }
    setBatchFiles([]);
    setBatchUploading(false);
  };

  function handleAlbumChange(songId: string, albumId: string) {
    if (albumId === '') {
      updateSong({ token, id: songId as Id<"songs">, clearAlbum: true });
    } else {
      updateSong({ token, id: songId as Id<"songs">, albumId: albumId as Id<"albums"> });
    }
  }

  function startRenameSong(song: any) {
    setEditingSongId(song._id);
    setEditingSongTitle(song.title);
  }

  async function saveRenameSong(songId: string) {
    if (editingSongTitle.trim()) {
      await updateSong({ token, id: songId as Id<"songs">, title: editingSongTitle.trim() });
    }
    setEditingSongId(null);
  }

  function moveUp(song: any) {
    if (!songs) return;
    const group = songs.filter((s: any) => s.albumId === song.albumId).sort((a: any, b: any) => a.order - b.order);
    const idx = group.findIndex((s: any) => s._id === song._id);
    if (idx <= 0) return;
    const prev = group[idx - 1];
    updateSong({ token, id: song._id as Id<"songs">, order: prev.order });
    updateSong({ token, id: prev._id as Id<"songs">, order: song.order });
  }

  function moveDown(song: any) {
    if (!songs) return;
    const group = songs.filter((s: any) => s.albumId === song.albumId).sort((a: any, b: any) => a.order - b.order);
    const idx = group.findIndex((s: any) => s._id === song._id);
    if (idx < 0 || idx >= group.length - 1) return;
    const next = group[idx + 1];
    updateSong({ token, id: song._id as Id<"songs">, order: next.order });
    updateSong({ token, id: next._id as Id<"songs">, order: song.order });
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Music</h2>

      {/* Single Upload */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-brown-lighter uppercase tracking-wide">Add single song</p>
        <FileButton
          accept=".m4a,.mp3,.wav,.aac,.flac,.ogg,audio/*"
          label="Choose Audio File"
          selectedName={audioFile?.name}
          onChange={setAudioFile}
          onClear={() => setAudioFile(null)}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>}
        />
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        {albums && albums.length > 0 && (
          <select value={newSongAlbumId} onChange={(e) => setNewSongAlbumId(e.target.value)}
            className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset bg-white">
            <option value="">No album</option>
            {albums.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
          </select>
        )}
        <button onClick={handleUpload} disabled={uploading || !audioFile || !title.trim()}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Add Song'}
        </button>
      </div>

      {/* Batch Upload */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3 mt-3">
        <p className="text-xs font-semibold text-brown-lighter uppercase tracking-wide">Batch upload multiple songs</p>
        <div>
          <input
            id={batchInputId}
            type="file"
            accept=".m4a,.mp3,.wav,.aac,.flac,.ogg,audio/*"
            multiple
            className="sr-only"
            onChange={handleBatchSelect}
          />
          <label
            htmlFor={batchInputId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-brown/25 bg-parchment/40 text-brown-light text-sm font-semibold cursor-pointer active:bg-parchment transition-colors hover:border-sunset/50 hover:text-brown"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
            </svg>
            Select multiple audio files
          </label>
        </div>
        {batchFiles.length > 0 && (
          <div className="space-y-2">
            {batchFiles.map((bf, i) => (
              <div key={i} className="flex items-center gap-2 bg-parchment/30 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="text"
                    value={bf.title}
                    onChange={(e) => setBatchFiles((prev) => prev.map((f, j) => j === i ? { ...f, title: e.target.value } : f))}
                    className="w-full px-2 py-1 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset bg-white"
                  />
                  <p className="text-xs text-brown-lighter truncate">{bf.file.name}</p>
                </div>
                {albums && albums.length > 0 && (
                  <select
                    value={bf.albumId}
                    onChange={(e) => setBatchFiles((prev) => prev.map((f, j) => j === i ? { ...f, albumId: e.target.value } : f))}
                    className="text-xs px-2 py-1 rounded border border-brown/20 text-brown bg-white focus:outline-none focus:border-sunset max-w-[110px]"
                  >
                    <option value="">No album</option>
                    {albums.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                  </select>
                )}
                <button onClick={() => setBatchFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-xs text-berry/60 active:text-berry flex-shrink-0">✕</button>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button onClick={handleBatchUpload} disabled={batchUploading}
                className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
                {batchUploading ? `Uploading ${batchProgress}/${batchFiles.length}...` : `Upload ${batchFiles.length} songs`}
              </button>
              <button onClick={() => setBatchFiles([])} className="text-sm text-brown-lighter active:text-brown">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Song List */}
      <div className="mt-4">
        <div className="relative mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-lighter pointer-events-none">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            value={songSearch}
            onChange={(e) => setSongSearch(e.target.value)}
            placeholder={`Search ${songs?.length ?? ''} songs...`}
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset bg-white"
          />
          {songSearch && (
            <button onClick={() => setSongSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-lighter active:text-brown">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-2">
        {songs?.filter(s => !songSearch.trim() || s.title.toLowerCase().includes(songSearch.trim().toLowerCase())).map((song) => (
          <div key={song._id} className="bg-white rounded-lg px-3 py-2.5 shadow-sm space-y-2">
            {/* Row 1: play + title */}
            <div className="flex items-center gap-2.5">
              <button onClick={() => togglePlay(song._id, song.url)}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-parchment/60 active:bg-sunset/20"
                aria-label={playingId === song._id ? 'Pause' : 'Play'}>
                {playingId === song._id ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-sunset"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                {editingSongId === song._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSongTitle}
                      onChange={(e) => setEditingSongTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveRenameSong(song._id); if (e.key === 'Escape') setEditingSongId(null); }}
                      className="flex-1 px-2 py-1 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset"
                      autoFocus
                    />
                    <button onClick={() => saveRenameSong(song._id)} className="text-xs text-sunset font-semibold flex-shrink-0">Save</button>
                    <button onClick={() => setEditingSongId(null)} className="text-xs text-brown-lighter flex-shrink-0">✕</button>
                  </div>
                ) : (
                  <p className={`font-display font-semibold text-sm truncate ${song.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                    {song.title}
                  </p>
                )}
                <p className="text-xs text-brown-lighter">{formatDuration(song.duration)}{song.featured && ' · Featured'}</p>
              </div>
            </div>
            {/* Row 2: actions */}
            <div className="flex items-center gap-1.5 flex-wrap pl-10">
              {albums && albums.length > 0 && (
                <select value={(song as any).albumId ?? ''} onChange={(e) => handleAlbumChange(song._id, e.target.value)}
                  className="text-xs px-2 py-1 rounded border border-brown/20 text-brown bg-white focus:outline-none focus:border-sunset max-w-[120px]">
                  <option value="">No album</option>
                  {albums.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
                </select>
              )}
              {(() => {
                const group = (songs ?? []).filter((s: any) => s.albumId === (song as any).albumId).sort((a: any, b: any) => a.order - b.order);
                const idx = group.findIndex((s: any) => s._id === song._id);
                return (
                  <>
                    <button onClick={() => moveUp(song)} disabled={idx <= 0}
                      className="text-xs px-2 py-1 rounded bg-parchment text-brown-lighter active:bg-parchment/70 disabled:opacity-30">↑</button>
                    <button onClick={() => moveDown(song)} disabled={idx >= group.length - 1}
                      className="text-xs px-2 py-1 rounded bg-parchment text-brown-lighter active:bg-parchment/70 disabled:opacity-30">↓</button>
                  </>
                );
              })()}
              {editingSongId !== song._id && (
                <button onClick={() => startRenameSong(song)} className="text-xs px-2 py-1 rounded bg-parchment text-brown-light active:bg-parchment/70">Rename</button>
              )}
              <button onClick={() => updateSong({ token, id: song._id as Id<"songs">, featured: !song.featured })}
                className={`text-xs px-2 py-1 rounded ${song.featured ? 'bg-lego-yellow text-brown' : 'bg-parchment text-brown-lighter'}`}>
                {song.featured ? 'Featured' : 'Feature'}
              </button>
              <button onClick={() => updateSong({ token, id: song._id as Id<"songs">, isVisible: !song.isVisible })}
                className={`text-xs px-2 py-1 rounded ${song.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}>
                {song.isVisible ? 'Visible' : 'Hidden'}
              </button>
              <button onClick={() => { if (confirm('Delete this song?')) removeSong({ token, id: song._id as Id<"songs"> }); }}
                className="text-xs text-berry/60 active:text-berry ml-auto">Delete</button>
            </div>
          </div>
        ))}
        {songs?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No songs yet.</p>
        )}
        </div>
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

  // Create form
  const [artFile, setArtFile] = useState<File | null>(null);
  const [artPreview, setArtPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [dimensions, setDimensions] = useState('');
  const [series, setSeries] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMedium, setEditMedium] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDimensions, setEditDimensions] = useState('');
  const [editSeries, setEditSeries] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!artFile) { setArtPreview(null); return; }
    const url = URL.createObjectURL(artFile);
    setArtPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [artFile]);

  function startEdit(artwork: any) {
    setEditingId(artwork._id);
    setEditTitle(artwork.title);
    setEditMedium(artwork.medium);
    setEditYear(artwork.year.toString());
    setEditDimensions(artwork.dimensions);
    setEditSeries(artwork.series);
    setEditDescription(artwork.description ?? '');
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    try {
      await updateArtwork({
        token,
        id: id as Id<"artworks">,
        title: editTitle.trim() || undefined,
        medium: editMedium.trim() || undefined,
        year: parseInt(editYear) || undefined,
        dimensions: editDimensions.trim() || undefined,
        series: editSeries.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
      setEditingId(null);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setEditSaving(false);
    }
  }

  const handleUpload = async () => {
    const file = artFile;
    if (!file || !title.trim() || !medium.trim()) return;

    setUploading(true);
    try {
      const { width, height } = await getImageDimensions(file);
      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
      const { storageId } = await result.json();
      await createArtwork({
        token, title: title.trim(), storageId,
        medium: medium.trim(),
        year: parseInt(year) || new Date().getFullYear(),
        dimensions: dimensions.trim() || `${width}x${height}`,
        series: series.trim() || medium.trim(),
        featured: false,
        aspectRatio: width / height,
        description: description.trim() || undefined,
      });
      setTitle(''); setMedium(''); setDimensions(''); setSeries(''); setDescription('');
      setArtFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Art</h2>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <FileButton accept="image/*" label="Choose Image" selectedName={artFile?.name} onChange={setArtFile}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-1 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>}
        />
        {artPreview && (
          <div className="flex items-start gap-3">
            <img src={artPreview} alt="Artwork preview" className="w-24 h-24 rounded-lg object-cover shadow-sm border border-brown/10" />
            <button type="button" onClick={() => setArtFile(null)} className="text-xs text-brown-lighter active:text-berry mt-1">Remove</button>
          </div>
        )}
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        <div className="flex gap-2">
          <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="Medium (e.g. Pixel Art)"
            className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year"
            className="w-20 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        </div>
        <div className="flex gap-2">
          <input type="text" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="Series (optional)"
            className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
          <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="Dimensions (auto)"
            className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        </div>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
          className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
        <button onClick={handleUpload} disabled={uploading}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Add Artwork'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {artworks?.map((artwork) => (
          <div key={artwork._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {editingId === artwork._id ? (
              <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-brown-lighter uppercase tracking-wide">Editing artwork</p>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title"
                  className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                <div className="flex gap-2">
                  <input type="text" value={editMedium} onChange={(e) => setEditMedium(e.target.value)} placeholder="Medium"
                    className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                  <input type="text" value={editYear} onChange={(e) => setEditYear(e.target.value)} placeholder="Year"
                    className="w-20 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                </div>
                <div className="flex gap-2">
                  <input type="text" value={editSeries} onChange={(e) => setEditSeries(e.target.value)} placeholder="Series"
                    className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                  <input type="text" value={editDimensions} onChange={(e) => setEditDimensions(e.target.value)} placeholder="Dimensions"
                    className="flex-1 min-w-0 px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                </div>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description (optional)"
                  className="w-full px-3 py-2 rounded border border-brown/20 text-brown text-sm focus:outline-none focus:border-sunset" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(artwork._id)} disabled={editSaving}
                    className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50">
                    {editSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg bg-parchment text-brown text-sm active:bg-parchment/70">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                {artwork.url && (
                  <img src={artwork.url} alt={artwork.title} className="w-10 h-10 rounded object-cover flex-shrink-0 border border-brown/10" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-display font-semibold text-sm truncate ${artwork.isVisible ? 'text-brown' : 'text-brown-lighter line-through'}`}>
                    {artwork.title}
                  </p>
                  <p className="text-xs text-brown-lighter">
                    {artwork.medium} · {artwork.year}
                    {artwork.featured && ' · Featured'}
                  </p>
                </div>
                <button onClick={() => startEdit(artwork)} className="text-xs px-2 py-1 rounded bg-parchment text-brown-light active:bg-parchment/70 flex-shrink-0">
                  Edit
                </button>
                <button onClick={() => updateArtwork({ token, id: artwork._id as Id<"artworks">, featured: !artwork.featured })}
                  className={`text-xs px-2 py-1 rounded flex-shrink-0 ${artwork.featured ? 'bg-lego-yellow text-brown' : 'bg-parchment text-brown-lighter'}`}>
                  {artwork.featured ? 'Featured' : 'Feature'}
                </button>
                <button onClick={() => updateArtwork({ token, id: artwork._id as Id<"artworks">, isVisible: !artwork.isVisible })}
                  className={`text-xs px-2 py-1 rounded flex-shrink-0 ${artwork.isVisible ? 'bg-grass/20 text-grass' : 'bg-parchment text-brown-lighter'}`}>
                  {artwork.isVisible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => { if (confirm('Delete this artwork?')) removeArtwork({ token, id: artwork._id as Id<"artworks"> }); }}
                  className="text-xs text-berry/60 active:text-berry flex-shrink-0">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {artworks?.length === 0 && (
          <p className="text-sm text-brown-lighter py-4 text-center">No artworks yet.</p>
        )}
      </div>
    </section>
  );
}

function SiteSection({ token }: { token: string }) {
  const settings = useQuery(api.siteSettings.get);
  const updateSettings = useMutation(api.siteSettings.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!photoFile) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  async function handleUpload() {
    if (!photoFile) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({ token });
      const result = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': photoFile.type }, body: photoFile });
      const { storageId } = await result.json();
      // Same image used for both the header photo and the browser tab icon
      await updateSettings({ token, profileImageStorageId: storageId, faviconStorageId: storageId });
      setPhotoFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-brown mb-4">Site</h2>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-brown-lighter uppercase tracking-wide">Profile photo</p>
        <p className="text-xs text-brown-lighter">The circular photo next to "Scott Forsey" in the header.</p>
        {settings?.profileImageUrl && !photoPreview && (
          <div className="flex items-center gap-3">
            <NextImage src={settings.profileImageUrl} alt="Current profile" width={56} height={56}
              className="w-14 h-14 rounded-full object-cover border border-brown/10" unoptimized />
            <span className="text-xs text-brown-lighter">Current photo</span>
          </div>
        )}
        {photoPreview && (
          <div className="flex items-center gap-3">
            <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-brown/10" />
            <button onClick={() => setPhotoFile(null)} className="text-xs text-brown-lighter active:text-berry">Remove</button>
          </div>
        )}
        <FileButton
          accept="image/*"
          label="Choose photo"
          selectedName={photoFile?.name}
          onChange={setPhotoFile}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !photoFile}
          className="px-4 py-2 rounded-lg bg-sunset text-white text-sm font-semibold active:bg-sunset/90 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Save photo'}
        </button>
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
