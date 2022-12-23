<script>
	import { goto } from '$app/navigation';
	import LoginWithSpotify from 'src/lib/LoginWithSpotify.svelte';
	import { login } from 'src/lib/spotify-api';
	import { accessTokenExpireTime, accessToken } from 'src/store';

	const params = new URLSearchParams(
		window.location.hash.slice(1, window.location.hash.length - 1)
	);
	const urlAccessToken = params.get('access_token');

	if (urlAccessToken != null) {
		accessToken.set(urlAccessToken);
		const d = new Date();
		d.setSeconds(d.getSeconds() + parseInt(params.get('expires_in') || '0'));
		accessTokenExpireTime.set(d);

		goto('/');
	}
</script>

<div class="flex flex-col items-center justify-center h-full p-4 space-y-6">
	{#if urlAccessToken}
		<div class="text-2xl">Logged in!</div>
		<div>Redirecting...</div>
	{:else}
		<div class="text-2xl">Please allow access to your Spotify account to continue.</div>
		<div>
			This is only giving access to your computer and I do not have access to it :), stay safe!
		</div>
		<div class="text-center">
			<div class="text-l pb-2">Try again?</div>
			<LoginWithSpotify onClick={login} />
		</div>
		<div>
			Feel free to check the source code yourself: <a
				class="underline"
				target="_blank"
				rel="noreferrer"
				href="https://github.com/antoinegag/spotify-export"
				>https://github.com/antoinegag/spotify-export</a
			>
		</div>
	{/if}
</div>
