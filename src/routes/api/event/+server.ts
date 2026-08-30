import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { buildRelayBody } from '$lib/server/plausible';

/**
 * First-party Plausible event proxy.
 *
 * Replaces the plain `/api/event` rewrite so accepted events can additionally
 * be mirrored to the native stats collector. Plausible stays authoritative:
 * the mirror runs only after Plausible accepts, and its failures never change
 * the response the browser sees.
 */

const RELAY_URL = 'https://stats.sreetamdas.com/v1/relay/areenaarora-com-prod';

/**
 * Vercel percent-encodes its geo headers, so "New%20Delhi" would otherwise be
 * stored verbatim and fork the location breakdown against Plausible.
 */
function vercelGeo(raw: string | null): string {
	if (raw === null || raw === '') return '';
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}

/**
 * Coarse, privacy-safe outcome logging: reason code only, never the payload,
 * URL, IP or UA. Without it a systematic native rejection stays invisible.
 */
async function recordRelayOutcome(response: Response): Promise<void> {
	if (response.status === 202) return;
	let reason = String(response.status);
	try {
		const data = (await response.json()) as { reason?: unknown };
		if (typeof data.reason === 'string') reason = data.reason.slice(0, 80);
	} catch {
		/* status-only outcome */
	}
	console.warn(`[analytics] native tee rejected: ${reason}`);
}

export const POST: RequestHandler = async ({ request }) => {
	const bodyText = await request.text();
	const relayBody = buildRelayBody(bodyText);

	const ua = request.headers.get('user-agent') ?? '';
	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';

	const upstream = await fetch('https://plausible.io/api/event', {
		method: 'POST',
		headers: {
			'content-type': request.headers.get('content-type') ?? 'text/plain',
			'user-agent': ua,
			'x-forwarded-for': ip
		},
		body: bodyText
	});

	if (upstream.ok) {
		const relayToken = env.RELAY_TOKEN ?? '';
		if (relayToken.length > 0) {
			try {
				// Awaited on purpose: Vercel may freeze the function once the response
				// is returned, so a floating mirror would silently drop events.
				// `waitUntil` from @vercel/functions is the fix if that dep is ever ok.
				const relayResponse = await fetch(RELAY_URL, {
					method: 'POST',
					headers: {
						'content-type': 'text/plain;charset=UTF-8',
						'x-relay-token': relayToken,
						'x-relay-ip': ip,
						'x-relay-ua': ua,
						'x-relay-country': request.headers.get('x-vercel-ip-country') ?? '',
						'x-relay-city': vercelGeo(request.headers.get('x-vercel-ip-city'))
					},
					body: relayBody
				});
				await recordRelayOutcome(relayResponse);
			} catch {
				console.warn('[analytics] native tee failed: relay_unreachable');
			}
		}
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers: { 'content-type': upstream.headers.get('content-type') ?? 'text/plain' }
	});
};

export const GET: RequestHandler = async () =>
	new Response(JSON.stringify({ error: 'Method not allowed', allowed: ['POST'] }), {
		status: 405,
		headers: { 'content-type': 'application/json', Allow: 'POST' }
	});
