import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

/**
 * Site-wide Plausible injection.
 *
 * `app.html` only templates SvelteKit-rendered pages, so the standalone decks
 * under `static/` — served through their `+server.ts` routes — never get the
 * snippet from it. Rather than pasting the snippet into each deck by hand (and
 * remembering to do it for every future one), add it here to any HTML response
 * that does not already carry it.
 *
 * Pages rendered through `app.html` already contain it and are left untouched.
 */
const PLAUSIBLE_SNIPPET = `<script async src="/api/js/script.js"></script>
<script>
	window.plausible = window.plausible || function () { (plausible.q = plausible.q || []).push(arguments) };
	plausible.init = plausible.init || function (i) { plausible.o = i || {} };
	plausible.init({ endpoint: '/api/event' });
</script>
</head>`;

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Keep local dev free of analytics, matching the `dev` check in +layout.svelte.
	if (dev) return response;

	if (!(response.headers.get('content-type') ?? '').includes('text/html')) {
		return response;
	}

	const html = await response.text();
	const alreadyTracked = html.includes('plausible');
	const body = alreadyTracked ? html : html.replace('</head>', PLAUSIBLE_SNIPPET);

	// The body was buffered, so any length header from upstream is now stale.
	const headers = new Headers(response.headers);
	headers.delete('content-length');

	return new Response(body, { status: response.status, statusText: response.statusText, headers });
};
