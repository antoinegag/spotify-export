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
		console.log(playlistWithTracks);
		tracksLoaded = true;

		return playlistWithTracks;
	}

	let playlistsInfoPromise = loadPlaylistsInformations();

	function createText(playlistsWithTracks: any[]) {
		return playlistsWithTracks.reduce(
			(text, playlist) =>
				`${text}# ${playlist.name}\n${playlist.tracks.reduce(
					(tracksText: string, track: any) =>
						`${tracksText}${track.track.name} - ${track.track.artists
							.map((artist: any) => artist.name)
							.join(', ')}\n`,
					''
				)}\n`,
			''
		);
	}

	function artistNames(track: any) {
		return track.track.artists.map((artist: any) => artist.name).join(', ');
	}
</script>

<main class="p-5">
	<div class="flex flex-col items-center justify-center min-h-full">
		<h1 class="title pb-5">Spotify Export</h1>
		{#if $accessToken != null}
			{#await playlistsInfoPromise then playlistsInfo}
				{#if !playListsReady}
					<Stretch color="black" size={50} />
					<div class="pt-5 text-lg">Loading <b>{playlistsInfo?.playlists.total}</b> playlists</div>
				{/if}
			{/await}
			{#await playlistsPromise then playlists}
				{#if !tracksLoaded && playListsReady}
					<Wave color="black" size={50} />
					<div class="pt-5 text-lg">Loading tracks for <b>{playlists.length}</b> playlists.</div>
					<div>(filtered out your liked playlists)</div>
				{/if}
			{/await}
			{#await playlistsWithTracksPromise then playlists}
				{#if tracksLoaded}
					<div class="text-center pb-5">
						<div>
							<b>{playlists.length}</b> playlists exported
						</div>
						<div class="text-2xl underline">
							<a
								href={window.URL.createObjectURL(
									new Blob([createText(playlists)], { type: 'text/plain' })
								)}
								download="spotify-export.txt">Download as text file</a
							>
						</div>
					</div>
					<div>
						{#each playlists as playlist}
							<div class="md:p-5 md:flex md:space-x-5 pb-5">
								<div><img class="w-32" src={playlist.images[0].url} alt="Album cover" /></div>
								<div>
									<div class="font-bold text-2xl pb-2">{playlist.name}</div>
									{#if playlist.description}
										<div class="text-xl pb-2">{playlist.description}</div>
									{/if}
									{#each playlist.tracks as track}
										<div class="pb-1">
											{track.track.name} - {artistNames(track)}
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
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
