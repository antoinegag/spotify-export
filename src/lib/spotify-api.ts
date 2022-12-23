const clientId = 'a66d952188de470d9380ff896215a670';
const redirect_uri = ``;

import { get } from 'svelte/store';
import { accessToken } from '../store';

export function login() {
	const url = new URLSearchParams();
	url.set('response_type', 'token');
	url.set('client_id', clientId);
	url.set('scope', 'playlist-read-private');
	url.set('redirect_uri', `${window.location.origin}/callback`);

	window.location.href = 'https://accounts.spotify.com/authorize?' + url.toString();
}

export async function fetchWithSpotifyAuth(url: string, options?: RequestInit) {
	const optionsWithAuth = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(accessToken),
			...options?.headers
		}
	};

	return fetch(url, optionsWithAuth);
}

export async function fetchSpotifyAPI(path: string, options?: RequestInit) {
	const optionsWithAuth = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + get(accessToken),
			...options?.headers
		}
	};

	return fetch('https://api.spotify.com/v1' + path, optionsWithAuth);
}

export async function getUserInfo() {
	const res = await fetchSpotifyAPI('/me');
	if (res.ok) {
		return res.json();
	}
}

export async function getAllPlaylists(options: { filter?: { ownerId: string } } = {}) {
	const playlists = [];
	const firstPage = await getPlaylists();

	const pages = Math.ceil(parseInt(firstPage.total) / parseInt(firstPage.limit));

	playlists.push(...firstPage.items);

	for (let i = 1; i < pages; i++) {
		const pagePlaylists = await getPlaylists({ page: i });
		playlists.push(...pagePlaylists.items);
	}

	if (options.filter) {
		return playlists.filter((playlist) => playlist.owner.id === options.filter?.ownerId);
	}

	return playlists;
}

export async function getPlaylists(
	options: { limit?: number; offset?: number; page?: number } = {}
) {
	let offset = 0;

	if (options.offset) {
		offset = options.offset;
	} else if (options.page) {
		offset = options.page * (options.limit ?? 50);
	}

	const res = await fetchSpotifyAPI(`/me/playlists?limit=${options.limit ?? 50}&offset=${offset}`);

	if (res.ok) {
		return res.json();
	}
}

export async function getPlaylistTracks(
	playlistId: string,
	options: { limit?: number; offset?: number; page?: number } = {}
) {
	let offset = 0;

	if (options.offset) {
		offset = options.offset;
	} else if (options.page) {
		offset = options.page * (options.limit ?? 0);
	}

	const res = await fetchSpotifyAPI(
		`/playlists/${playlistId}/tracks?limit=${options.limit ?? 50}&offset=${offset}`
	);

	if (res.ok) {
		return res.json();
	}
}

export async function getAllPlaylistTracks(playlistId: string) {
	const tracks = [];
	const firstPage = await getPlaylistTracks(playlistId);

	const pages = Math.ceil(parseInt(firstPage.total) / parseInt(firstPage.limit));

	tracks.push(...firstPage.items);

	for (let i = 1; i < pages; i++) {
		const pagePlaylists = await getPlaylistTracks(playlistId, { page: i });
		tracks.push(...pagePlaylists.items);
	}

	return tracks;
}

export async function loadPlaylistTracks(playlists: any[]) {
	return Promise.all(
		playlists.map(async (playlist) => {
			const tracks = await getAllPlaylistTracks(playlist.id);
			return {
				...playlist,
				tracks
			};
		})
	);
}
