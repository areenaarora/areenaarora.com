<script>
	import '../styles.css';
	import Header from '$lib/components/Header.svelte';
	import { dev } from '$app/environment';
</script>

<svelte:head>
	{#if !dev}
		<!-- Served through the first-party proxy in vercel.json; configured by the
		     plausible.init() stub in app.html. -->
		<script async src="/api/js/script.js"></script>
	{/if}
</svelte:head>

<Header />

<slot />
