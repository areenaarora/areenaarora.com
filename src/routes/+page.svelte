<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import RevealText from "$lib/components/RevealText.svelte";

	// Hint state
	let showHint = false;
	let clicked = false;

	// Inactivity timer
	const INACTIVITY_MS = 5000;
	let timer: ReturnType<typeof setTimeout> | null = null;

	const nodes = {
		s1: `I’m a [[data journalist, -> s2]]`,
		s2: `based in Chennai, [[since May, 2025.-> s3]]`,
		s3: `[[I build stuff -> s4]] for the web at The Hindu.`,
		s4: `I [[combine code and design -> s5]] to make stories come alive on the web.`,
		s5: `My recent projects include work on how heat and humidity affect [[blue-collar workers, -> s6]]`,
		s6: `and an investigation into [[mass voter deletions -> s7]] from Bihar’s rolls.`,
		s7: `My work blends reporting, data analysis, and information design- I'm excited to see what's next!`,
	};

	function scheduleHint() {
		if (timer) clearTimeout(timer);
		// Only schedule if the user hasn’t already clicked through
		if (!clicked) {
			timer = setTimeout(() => {
				if (!clicked) showHint = true;
			}, INACTIVITY_MS);
		}
	}

	function markInteraction() {
		// Any interaction hides the hint and restarts the inactivity timer (unless already clicked)
		showHint = false;
		if (!clicked) scheduleHint();
	}

	function markClicked() {
		clicked = true; // permanently suppress future hints
		showHint = false;
		if (timer) clearTimeout(timer);
		timer = null;
	}

	onMount(() => {
		// Start the first timer
		scheduleHint();

		// Consider these as “activity” and reset the timer
		const evs = ["mousemove", "keydown", "touchstart", "scroll", "pointermove", "focusin"];
		evs.forEach(e => window.addEventListener(e, markInteraction, { passive: true }));

		return () => {
			if (timer) clearTimeout(timer);
			evs.forEach(e => window.removeEventListener(e, markInteraction));
		};
	});

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<section class="home-hero">
	<h1>I’m Areena.</h1>

	<!-- Clicking anywhere inside the intro counts as interaction; the RevealText link click calls markClicked via event delegation -->
	<div class="intro" on:click={markClicked}>
		<RevealText {nodes} startId="s1" />
		{#if showHint}
			<span class="click-hint" aria-hidden="true">click me</span>
		{/if}
	</div>
</section>

<style>
	.home-hero {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		min-height: 80vh;
		padding: 6rem 2rem 2rem;
		width: 100%;
		max-width: 90ch;
		margin: 0 auto;
		position: relative;
	}

	.home-hero h1 {
		font-size: clamp(2.8rem, 8vw, 6.5rem);
		line-height: 1.1;
		margin: -30px 0 1.5rem 0;
		text-align: left;
	}

	.intro {
		width: 100%;
		margin: 0;
		text-align: left;
		position: relative; /* anchor for absolute hint */
	}

	/* ----- Hint badge (more pop) ----- */
	.click-hint {
		position: absolute;
		left: 4.1rem;
		top: -0.35rem;

		display: inline-block;
		padding: 6px 8px;
		font-size: 0.85rem;
		font-weight: 600;
		color: black;
		background: #ffb6c1;
		border-radius: 0; /* sharp rectangle */
		box-shadow: none;
		pointer-events: none;
	}

	/* small arrow “tail” pointing down to the link */
	.click-hint {
		position: absolute;
		left: 4.1rem;
		top: -0.35rem;

		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px 14px;
		font-size: 0.9rem;
		font-weight: 500;
		color: #a40000; /* deep red text */
		background: #ffe5e8; /* pale pink fill */
		border: 2px solid #a40000; /* matching border */
		border-radius: 6px; /* slightly rounded corners */
		pointer-events: none;
		box-shadow: none;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
		}
		50% {
			transform: scale(1.1);
			box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
		}
	}
</style>
