<script>
	import Footer from '../lib/Footer.svelte';
	import Header from '../lib/Header.svelte';
	import '../app.css';
</script>

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
