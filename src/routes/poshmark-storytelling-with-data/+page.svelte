<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import slides from '$lib/data/poshmark-slides.json';

	let current = 0;
	let viewer: HTMLDivElement;
	let fullscreenError = '';

	function readHash() {
		const number = Number(window.location.hash.slice(1));
		current = Number.isInteger(number) && number >= 1 && number <= slides.length ? number - 1 : 0;
	}

	function goTo(index: number) {
		current = Math.max(0, Math.min(slides.length - 1, index));
		window.location.hash = String(current + 1);
	}

	function handleKey(event: KeyboardEvent) {
		if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, button, a, summary, [contenteditable]')) return;
		if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
			event.preventDefault();
			goTo(current + 1);
		} else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
			event.preventDefault();
			goTo(current - 1);
		} else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			goTo(event.key === 'Home' ? 0 : slides.length - 1);
		}
	}

	async function toggleFullscreen() {
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await viewer.requestFullscreen();
		} catch {
			fullscreenError = 'Fullscreen is unavailable in this browser.';
		}
	}

	onMount(readHash);
</script>

<svelte:head>
	<title>Poshmark · Storytelling with Data | Areena Arora</title>
	<meta name="description" content="Storytelling with Data: from showing numbers to moving people. Presentation by Areena Arora for Poshmark." />
	<meta property="og:title" content="Storytelling with Data | Areena Arora" />
	<meta property="og:image" content="https://areenaarora.com/poshmark-storytelling-with-data/slide-01.jpg" />
</svelte:head>

<svelte:window onkeydown={handleKey} onhashchange={readHash} />

<main>
	<header class="intro">
		<div>
			<h1>Storytelling with Data</h1>
			<p>From showing numbers to moving people · Areena Arora</p>
		</div>
		<div class="downloads">
			<a href={`${base}/downloads/Storytelling_with_Data_final.pptx`} download>Download PowerPoint</a>
			<a href={`${base}/downloads/poshmark-storytelling-with-data.pdf`} target="_blank" rel="noopener noreferrer">Open PDF</a>
		</div>
	</header>

	<div class="viewer" bind:this={viewer}>
		<div class="slide">
			<img src={`${base}/poshmark-storytelling-with-data/slide-${String(current + 1).padStart(2, '0')}.jpg`} alt={`Slide ${current + 1}: ${slides[current].title}`} width="1800" height="1013" />
		</div>
		<nav class="controls" aria-label="Slide navigation">
			<button onclick={() => goTo(current - 1)} disabled={current === 0} aria-label="Previous slide">← Previous</button>
			<label>
				<span class="sr-only">Choose a slide</span>
				<select value={current} onchange={(event) => goTo(Number(event.currentTarget.value))}>
					{#each slides as slide, index}
						<option value={index}>{index + 1} / {slides.length} · {slide.title}</option>
					{/each}
				</select>
			</label>
			<button onclick={() => goTo(current + 1)} disabled={current === slides.length - 1} aria-label="Next slide">Next →</button>
			<button class="fullscreen" onclick={toggleFullscreen}>Fullscreen</button>
		</nav>
		<p class="sr-only" aria-live="polite">Slide {current + 1} of {slides.length}: {slides[current].title}</p>
		{#if fullscreenError}<p role="status">{fullscreenError}</p>{/if}
	</div>
	<p class="hint">Use the arrow keys to move between slides.</p>
	<details>
		<summary>Read slide {current + 1} text</summary>
		<pre>{slides[current].text}</pre>
	</details>
</main>

<style>
	main { width: min(1200px, calc(100% - 2rem)); margin: 2.5rem auto; }
	.intro { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; }
	h1 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; margin: 0.5rem 0; }
	p { margin: 0; }
	.downloads, .controls, .hint, details { font-family: Inter, system-ui, sans-serif; }
	.downloads { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; }
	.downloads a { text-underline-offset: 4px; }
	.viewer { background: #f3f4f6; border: 1px solid #ddd; }
	.slide { display: flex; align-items: center; justify-content: center; background: white; }
	img { display: block; width: 100%; height: auto; object-fit: contain; }
	.controls { display: flex; gap: 0.75rem; align-items: center; padding: 0.8rem; }
	label { flex: 1; min-width: 0; }
	button, select { font: inherit; font-size: 0.85rem; padding: 0.6rem; border: 1px solid #bbb; background: white; color: #111; border-radius: 3px; }
	select { width: 100%; }
	button { cursor: pointer; white-space: nowrap; }
	button:disabled { opacity: 0.4; cursor: default; }
	button:focus-visible, select:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid #225fba; outline-offset: 3px; }
	.hint { color: #555; font-size: 0.8rem; margin: 0.8rem 0 1.5rem; }
	summary { cursor: pointer; }
	pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 0.95rem; line-height: 1.5; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
	.viewer:fullscreen { display: flex; flex-direction: column; justify-content: center; border: 0; padding: 1rem; }
	.viewer:fullscreen .slide { flex: 1; min-height: 0; background: transparent; }
	.viewer:fullscreen img { max-height: 100%; width: auto; max-width: 100%; }
	@media (max-width: 640px) {
		main { margin-block: 1.5rem; }
		.intro { flex-direction: column; align-items: start; }
		.controls { gap: 0.4rem; flex-wrap: wrap; }
		.controls label { order: -1; flex-basis: 100%; }
		.fullscreen { margin-left: auto; }
		button { font-size: 0.75rem; }
	}
</style>
