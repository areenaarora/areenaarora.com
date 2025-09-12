<script lang="ts">
	import { onDestroy, tick } from "svelte";

	// Props
	export let nodes: Record<string, string>;
	export let startId: string;

	// Reveal state
	let history: string[] = [startId];

	function go(to: string) {
		if (nodes[to] && history[history.length - 1] !== to) {
			history = [...history, to];
			nudgeScroll(); // only ever scrolls downward on mobile
		}
	}

	// --- parsing -------------------------------------------------------------
	type Part = { kind: "text"; text: string } | { kind: "link"; label: string; target: string };

	const RE = /\[\[(.+?)\s*->\s*([^\[\]\s]+)\]\]/g;

	function parse(input: string): Part[] {
		const out: Part[] = [];
		let i = 0,
			m: RegExpExecArray | null;
		while ((m = RE.exec(input))) {
			if (m.index > i) out.push({ kind: "text", text: input.slice(i, m.index) });
			out.push({ kind: "link", label: m[1], target: m[2] });
			i = m.index + m[0].length;
		}
		if (i < input.length) out.push({ kind: "text", text: input.slice(i) });
		return out;
	}

	// --- current step & parts -----------------------------------------------
	$: currentId = history[history.length - 1];
	$: parts = parse((nodes[currentId] ?? "").replace(/^\s+/, ""));
	$: pastIds = history.slice(0, -1);

	// --- typewriter engine ---------------------------------------------------
	let partIndex = 0;
	let charIndex = 0;
	let typing = false;
	const speed = 28;
	let timer: ReturnType<typeof setInterval> | null = null;

	function visibleLen(p: Part) {
		return p.kind === "text" ? p.text.length : p.label.length;
	}

	// ---- mobile-aware scroll (down-only) with bottom margin ----
	let sentinel: HTMLElement | null = null;

	// Tweak to change bottom gap when auto-scrolling
	const MOBILE_SCROLL_MARGIN_BOTTOM_PX = 24;

	const isMobile = () =>
		typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

	async function nudgeScroll() {
		if (!isMobile()) return;
		await tick();
		if (!sentinel) return;

		// Always keep some breathing room at the bottom when we do scroll
		sentinel.style.scrollMarginBottom = `${MOBILE_SCROLL_MARGIN_BOTTOM_PX}px`;

		// Only scroll DOWN when the sentinel is below the viewport bottom.
		// Never scroll up — header stays visible.
		const rect = sentinel.getBoundingClientRect();
		const needBottom = rect.bottom > window.innerHeight - MOBILE_SCROLL_MARGIN_BOTTOM_PX;

		if (needBottom) {
			sentinel.scrollIntoView({
				behavior: "smooth",
				block: "end",
				inline: "nearest",
			});
		}
	}

	function startTyping() {
		typing = true;
		if (timer) clearInterval(timer);

		timer = setInterval(() => {
			const p = parts[partIndex];
			if (!p) {
				typing = false;
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
				return;
			}

			const len = visibleLen(p);

			if (charIndex < len) {
				charIndex += 1;
				nudgeScroll();
			} else {
				partIndex += 1;
				charIndex = 0;

				while (parts[partIndex] && visibleLen(parts[partIndex]) === 0) {
					partIndex += 1;
				}

				nudgeScroll();

				if (partIndex >= parts.length) {
					typing = false;
					if (timer) {
						clearInterval(timer);
						timer = null;
					}
				}
			}
		}, speed);
	}

	// Reset typing whenever the step changes
	$: if (parts) {
		partIndex = 0;
		charIndex = 0;
		startTyping();
	}

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	// helpers
	function fullText(p: Part) {
		return p.kind === "text" ? p.text : p.label;
	}
	function partialText(p: Part, upTo: number) {
		return fullText(p).slice(0, upTo);
	}
</script>

<p class="reveal" aria-live="polite">
	{#each pastIds as id}
		<span class="step">
			{#each parse(nodes[id]) as p}
				{#if p.kind === "text"}
					{p.text}
				{:else}
					<span class="token token--frozen">{p.label}</span>
				{/if}
			{/each}
		</span>
	{/each}

	<span class="step">
		{#each parts as p, i}
			{#if i < partIndex}
				{#if p.kind === "text"}
					{p.text}
				{:else}
					<button
						type="button"
						class="token token--active"
						on:click={() => go(p.target)}
						disabled={typing}
					>
						{p.label}
					</button>
				{/if}
			{:else if i === partIndex}
				{#if p.kind === "text"}
					{partialText(p, charIndex)}
				{:else}
					<button
						type="button"
						class="token token--active"
						on:click={() => go(p.target)}
						disabled={typing}
					>
						{partialText({ kind: "link", label: p.label, target: p.target }, charIndex)}
					</button>
				{/if}
			{/if}
		{/each}

		{#if typing}
			<span class="caret" aria-hidden="true"></span>
		{/if}
	</span>

	<!-- scroll target; we only scroll down to it when needed -->
	<span
		class="sentinel"
		aria-hidden="true"
		bind:this={sentinel}
		style="display:inline-block;width:0;height:0;"
	></span>
</p>

<style>
	.reveal {
		max-width: min(80ch, 92vw);
		font-size: 1.5rem;
		line-height: 1.6;
		text-align: left;
		margin-inline: auto;
	}

	.step {
		display: inline;
	}
	.step::after {
		content: " ";
	}

	.token,
	.token--active,
	.token--frozen {
		font: inherit;
		color: inherit;
		line-height: inherit;
		letter-spacing: inherit;
	}

	.token--active {
		background: none;
		text-decoration: underline;
		text-decoration-color: #000dff;
		border: 0;
		padding: 0;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		display: inline;
		cursor: pointer;
		text-underline-offset: 0.2em;
	}
	.token--active:disabled {
		cursor: default;
		opacity: 1;
	}

	.caret {
		display: inline-block;
		width: 0.5ch;
		height: 1em;
		border-right: 2px solid currentColor;
		margin-left: 0.05ch;
		vertical-align: -0.15em;
		animation: blink 0.9s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
