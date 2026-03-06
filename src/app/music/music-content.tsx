'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrackList } from '@/components/music/TrackList';
import { useAudioPlayer } from '@/lib/audio/context';
import { songToTrack } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/types';
import type { SongData, AlbumData } from '@/lib/types';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { slugify } from '@/lib/slug';

type SortOption = 'title-asc' | 'title-desc' | 'duration-asc' | 'duration-desc' | 'recently-added';

function AlbumFilterDropdown({
  albums,
  selected,
  onChange,
}: {
  albums: AlbumData[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    // Defer listener so the opening tap doesn't immediately close the dropdown
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onOutside);
      document.addEventListener('touchstart', onOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  }

  const label = selected.length === 0
    ? 'All Albums'
    : selected.length === 1
      ? (albums.find(a => a._id === selected[0])?.title ?? (selected[0] === '__none__' ? 'No Album' : '1 Album'))
      : `${selected.length} Albums`;

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-brown/20 bg-white dark:bg-[#162040] text-brown dark:text-[#E8EDF8] text-sm focus:outline-none focus:border-sunset"
      >
        <span className="truncate">{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter flex-shrink-0 ml-2">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E2D52] rounded-xl shadow-lg border border-brown/10 dark:border-white/10 overflow-hidden z-20 py-1">
          <button
            onClick={() => onChange([])}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.length === 0 ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
              {selected.length === 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </span>
            All Albums
          </button>
          {albums.map(a => (
            <button
              key={a._id}
              onClick={() => toggle(a._id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes(a._id) ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
                {selected.includes(a._id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              </span>
              {a.title}
            </button>
          ))}
          <button
            onClick={() => toggle('__none__')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes('__none__') ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
              {selected.includes('__none__') && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </span>
            No Album
          </button>
        </div>
      )}
    </div>
  );
}

function GenreFilterDropdown({
  genres,
  selected,
  onChange,
}: {
  genres: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onOutside);
      document.addEventListener('touchstart', onOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  function toggle(g: string) {
    if (selected.includes(g)) onChange(selected.filter(x => x !== g));
    else onChange([...selected, g]);
  }

  const label = selected.length === 0
    ? 'All Genres'
    : selected.length === 1
      ? (selected[0] === '__none__' ? 'No Genre' : selected[0])
      : `${selected.length} Genres`;

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-brown/20 bg-white dark:bg-[#162040] text-brown dark:text-[#E8EDF8] text-sm focus:outline-none focus:border-sunset"
      >
        <span className="truncate">{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter flex-shrink-0 ml-2">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E2D52] rounded-xl shadow-lg border border-brown/10 dark:border-white/10 overflow-hidden z-20 py-1 max-h-60 overflow-y-auto">
          <button
            onClick={() => onChange([])}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.length === 0 ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
              {selected.length === 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </span>
            All Genres
          </button>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => toggle(g)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes(g) ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
                {selected.includes(g) && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
              </span>
              {g}
            </button>
          ))}
          <button
            onClick={() => toggle('__none__')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown dark:text-[#E8EDF8] hover:bg-parchment/60 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.includes('__none__') ? 'bg-sunset border-sunset' : 'border-brown/30 dark:border-white/20'}`}>
              {selected.includes('__none__') && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
            </span>
            No Genre
          </button>
        </div>
      )}
    </div>
  );
}

export function MusicPageContent() {
  const songs = useQuery(api.songs.list);
  const albums = useQuery(api.albums.list);
  const { playQueue, toggleShuffle, shuffle } = useAudioPlayer();
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('track');
  const hasAutoPlayed = useRef(false);
  const playQueueRef = useRef(playQueue);
  playQueueRef.current = playQueue;
  const [search, setSearch] = useState('');
  const [albumFilters, setAlbumFilters] = useState<string[]>([]);
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');

  const allGenres = useMemo(() => {
    if (!songs) return [];
    const set = new Set<string>();
    for (const s of songs as SongData[]) {
      if (s.genre) set.add(s.genre);
    }
    return Array.from(set).sort();
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    let list = songs as SongData[];

    // Album filter (multi)
    if (albumFilters.length > 0) {
      list = list.filter(s => {
        if (albumFilters.includes('__none__') && !s.albumId) return true;
        if (s.albumId && albumFilters.includes(s.albumId)) return true;
        return false;
      });
    }

    // Genre filter (multi)
    if (genreFilters.length > 0) {
      list = list.filter(s => {
        if (genreFilters.includes('__none__') && !s.genre) return true;
        if (s.genre && genreFilters.includes(s.genre)) return true;
        return false;
      });
    }

    // Search
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(s => s.title.toLowerCase().includes(q));

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
      if (sortBy === 'duration-asc') return a.duration - b.duration;
      if (sortBy === 'duration-desc') return b.duration - a.duration;
      if (sortBy === 'recently-added') return (b._creationTime ?? 0) - (a._creationTime ?? 0);
      return 0;
    });

    return list;
  }, [songs, search, albumFilters, genreFilters, sortBy]);

  useEffect(() => {
    if (!trackParam || hasAutoPlayed.current || !songs || (songs as SongData[]).length === 0) return;
    const allSongs = songs as SongData[];
    const idx = allSongs.findIndex(s => slugify(s.title) === trackParam);
    if (idx === -1) return;
    hasAutoPlayed.current = true;
    const tracks = allSongs.map(s => songToTrack(s));
    playQueueRef.current(tracks, idx);
  }, [trackParam, songs]);

  if (!songs || !albums) {
    return <p className="text-brown-lighter">Loading...</p>;
  }

  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  function handlePlayAll() {
    const tracks = filteredSongs.map(s => songToTrack(s));
    if (shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  function handleShuffle() {
    const tracks = filteredSongs.map(s => songToTrack(s));
    if (!shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  // No albums — flat list
  if (albums.length === 0) {
    return (
      <>
        <p className="text-brown-light mb-6">{songs.length} tracks · {formatDuration(totalDuration)} total</p>
        <div className="mb-6 flex gap-3">
          <Button onClick={handlePlayAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M8 5v14l11-7z" /></svg>
            Play All
          </Button>
          <Button onClick={handleShuffle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
            Shuffle
          </Button>
        </div>
        <TrackList songs={songs as SongData[]} />
      </>
    );
  }

  // Grid view
  return (
    <>
      {/* Album grid */}
      {(() => {
        const officialAlbums = (albums as AlbumData[]).filter(a => !a.albumType || a.albumType === 'album');
        const draftAlbums = (albums as AlbumData[]).filter(a => a.albumType === 'draft');

        function renderAlbumCard(album: AlbumData) {
          const albumSongs = (songs as SongData[]).filter(s => s.albumId === album._id);
          if (albumSongs.length === 0) return null;
          return (
            <Link key={album._id} href={`/music/${slugify(album.title)}`} className="text-left group">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group-active:scale-95 transition-transform">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full"
                    style={{ background: `linear-gradient(135deg, ${album.gradientFrom ?? '#f4a261'}, ${album.gradientTo ?? '#e76f51'})` }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-brown ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <p className="mt-2 font-display font-semibold text-sm text-brown truncate">{album.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-brown-lighter">{albumSongs.length} tracks</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const url = `${window.location.origin}/music/${slugify(album.title)}`;
                    if (navigator.share) {
                      navigator.share({ title: album.title, url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  className="p-1 text-brown-lighter hover:text-brown transition-colors"
                  aria-label="Share album"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>
                </button>
              </div>
            </Link>
          );
        }

        const officialCards = officialAlbums.map(renderAlbumCard).filter(Boolean);
        const draftCards = draftAlbums.map(renderAlbumCard).filter(Boolean);

        return (
          <>
            {officialCards.length > 0 && (
              <>
                <h2 className="font-display font-bold text-brown text-lg mb-3">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
                  {officialCards}
                </div>
              </>
            )}
            {draftCards.length > 0 && (
              <>
                <h2 className="font-display font-bold text-brown text-lg mb-3">Drafts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
                  {draftCards}
                </div>
              </>
            )}
          </>
        );
      })()}

      {/* Genre pills */}
      {allGenres.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-brown text-lg mb-3">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {allGenres.map(g => {
              const active = genreFilters.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => {
                    if (active) setGenreFilters(genreFilters.filter(x => x !== g));
                    else setGenreFilters([...genreFilters, g]);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-sunset text-white'
                      : 'bg-parchment dark:bg-[#1E2D52] text-brown dark:text-[#E8EDF8] hover:bg-sunset/20'
                  }`}
                >
                  {g}
                </button>
              );
            })}
            {genreFilters.length > 0 && (
              <button
                onClick={() => setGenreFilters([])}
                className="px-3.5 py-1.5 rounded-full text-sm font-semibold text-brown-lighter hover:text-brown transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* All Tracks */}
      <div>
        <h2 className="font-display font-bold text-brown text-lg mb-3">All Tracks</h2>

        {/* Filter + Sort row */}
        {(albums.length > 0 || allGenres.length > 0) && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {albums.length > 0 && (
              <AlbumFilterDropdown
                albums={albums as AlbumData[]}
                selected={albumFilters}
                onChange={setAlbumFilters}
              />
            )}
            {allGenres.length > 0 && (
              <GenreFilterDropdown
                genres={allGenres}
                selected={genreFilters}
                onChange={setGenreFilters}
              />
            )}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-brown/20 bg-white dark:bg-[#162040] text-brown dark:text-[#E8EDF8] text-sm focus:outline-none focus:border-sunset appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238B7355'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              <option value="title-asc">Title A→Z</option>
              <option value="title-desc">Title Z→A</option>
              <option value="duration-asc">Shortest</option>
              <option value="duration-desc">Longest</option>
              <option value="recently-added">Recently Added</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 gap-3">
          <p className="text-brown-light text-sm whitespace-nowrap">{songs.length} tracks · {formatDuration(totalDuration)}</p>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handlePlayAll} size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:mr-1.5"><path d="M8 5v14l11-7z" /></svg>
              <span className="hidden sm:inline">Play All</span>
            </Button>
            <Button onClick={handleShuffle} size="sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:mr-1.5"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
              <span className="hidden sm:inline">Shuffle</span>
            </Button>
          </div>
        </div>
        <div className="relative mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-lighter pointer-events-none">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-sunset"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-lighter active:text-brown"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
        {filteredSongs.length === 0 ? (
          <p className="text-sm text-brown-lighter text-center py-8">No songs match your filters</p>
        ) : (
          <TrackList songs={filteredSongs} />
        )}
      </div>
    </>
  );
}
