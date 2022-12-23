<script lang="ts">
	export let onClick: () => void;
</script>

<button class="bg-green-600 text-white rounded-full px-5 py-3" on:click={onClick}
	>Login with Spotify</button
>
