<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.status} | Areena Arora</title>
</svelte:head>

<main class="error-page" aria-labelledby="error-title">
	<section class="error-card">
		<p class="status">{$page.status}</p>
		<h1 id="error-title">{$page.error?.message ?? 'Page not found'}</h1>
		<a href="/">Back home</a>
	</section>
</main>

<style>
	.error-page {
		min-height: calc(100svh - var(--header-h, 58px));
		display: grid;
		place-items: center;
		padding: clamp(2rem, 6vw, 5rem) 1rem;
		text-align: center;
	}

	.error-card {
		display: grid;
		gap: 0.9rem;
		justify-items: center;
	}

	.status {
		margin: 0;
		font-size: clamp(4rem, 14vw, 10rem);
		font-weight: 600;
		line-height: 0.85;
		letter-spacing: -0.04em;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.4rem, 3vw, 2.2rem);
		font-weight: 500;
		line-height: 1.1;
	}

	a {
		margin-top: 0.75rem;
		color: inherit;
		font-size: 1rem;
		text-underline-offset: 4px;
	}
</style>
