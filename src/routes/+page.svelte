<script lang="ts">
	import { Stretch, Wave } from 'svelte-loading-spinners';
	import LoginWithSpotify from 'src/lib/LoginWithSpotify.svelte';
	import {
		login,
		getPlaylists,
		getUserInfo,
		getAllPlaylists,
		loadPlaylistTracks
	} from 'src/lib/spotify-api';
	import { accessTokenExpireTime, accessToken } from 'src/store';

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	console.log($accessToken, $accessTokenExpireTime);
	let playListsReady = false;
	let tracksLoaded = false;
	let playlistsPromise: Promise<any> = Promise.resolve({});
	let playlistsWithTracksPromise: Promise<any[]> = Promise.resolve([]);

	async function loadPlaylistsInformations() {
		if ($accessToken != null) {
			const playlists = await getPlaylists();
			const userInfo = await getUserInfo();
			playlistsPromise = loadPlaylists(userInfo.id);

			return { playlists, userInfo };
		}
	}

	async function loadPlaylists(ownerId: string) {
		const playlists = await getAllPlaylists({ filter: { ownerId } });
		playListsReady = true;
		playlistsWithTracksPromise = loadTracks(playlists);
		return playlists;
	}

	async function loadTracks(playlists: any[]) {
		const playlistWithTracks = await loadPlaylistTracks(playlists);
		tracksLoaded = true;
		return playlistWithTracks;
	}

	let playlistsInfoPromise = loadPlaylistsInformations();
</script>

<main>
	<div class="flex flex-col items-center justify-center h-full">
		<h1 class="title pb-5">Spotify Export</h1>
		{#if $accessToken != null}
			{#await playlistsInfoPromise then playlistsInfo}
				{#if !playListsReady}
					<Stretch color="black" size={50} />
					<div class="pt-5 text-lg">Loading <b>{playlistsInfo?.playlists.total}</b> playlists</div>
				{/if}
			{/await}
			{#await playlistsPromise then playlists}
				{#if !tracksLoaded}
					<Wave color="black" size={50} />
					<div class="pt-5 text-lg">Loading tracks for <b>{playlists.length}</b> playlists.</div>
					<div>(filtered out your liked playlists)</div>
				{/if}
			{/await}
			{#await playlistsWithTracksPromise then playlists}
				{#each playlists as playlist}
					<div class="w-full p-2">
						<div class="font-bold text-2xl pb-2">{playlist.name}</div>
						{#if playlist.description}
							<div class="text-xl pb-5">{playlist.description}</div>
						{/if}
						{#each playlist.tracks as track}
							<div>
								{track.track.name}
							</div>
						{/each}
					</div>
				{/each}
			{/await}
		{:else}
			<LoginWithSpotify onClick={login} />
		{/if}
	</div>
</main>

<style>
	.title {
		font-family: 'Oswald', sans-serif;
		font-family: 'Unbounded', cursive;
		@apply font-bold text-4xl;
	}
</style>
