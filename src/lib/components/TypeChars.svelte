<script lang="ts">
	import { createEventDispatcher, onDestroy } from "svelte";

	export let text = ""; // string to type (may contain HTML entities)
	export let speed = 10; // ms per character
	export let start = true; // re-start typing when this toggles true

	const dispatch = createEventDispatcher();

	let out = "";
	let i = 0;
	let timer: number | undefined;

	// Decode entities like &amp; → &
	function decode(html: string) {
		const el = document.createElement("textarea");
		el.innerHTML = html;
		return el.value;
	}
	$: decoded = decode(text);

	// (re)start typing when `start` or `decoded` changes
	$: if (start) {
		clearInterval(timer);
		out = "";
		i = 0;
		timer = window.setInterval(() => {
			out += decoded[i] ?? "";
			i++;
			if (i >= decoded.length) {
				clearInterval(timer);
				dispatch("done");
			}
		}, speed);
	}

	onDestroy(() => clearInterval(timer));
</script>

<span class="tw">{out}</span>

<style>
	.tw {
		white-space: pre-wrap;
	}
</style>
