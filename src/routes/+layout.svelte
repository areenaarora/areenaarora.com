<script>
	import '../styles.css';
	import Header from '$lib/components/Header.svelte';
	import { dev } from '$app/environment';
</script>

<svelte:head>
	{#if !dev}
		<script
			data-api="/stats/api/event"
			data-domain="areenaarora.com"
			src="/stats/js/script.js"
		></script>
	{/if}
</svelte:head>

<Header />

<slot />
