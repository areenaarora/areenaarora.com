<script>
	import { dev } from '$app/environment';
	import Footer from '../lib/Footer.svelte';
	import Header from '../lib/Header.svelte';
	import '../app.css';
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
<main>
	<slot />
</main>
<Footer />

<style>
	main {
		padding: 0 15px;
	}
</style>
