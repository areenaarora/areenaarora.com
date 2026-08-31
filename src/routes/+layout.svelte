<script>
	import '../styles.css';
	import Header from '$lib/components/Header.svelte';
	import { dev } from '$app/environment';
</script>

<svelte:head>
	{#if !dev}
		<script async src="/v1/nltyx.js" data-endpoint="/api/prxy/nltyx" data-key="event"></script>
	{/if}
</svelte:head>

<Header />

<slot />
