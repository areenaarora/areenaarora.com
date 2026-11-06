import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const RELAY_URL = 'https://stats.sreetamdas.com/v1/relay/areenaarora-com-prod';
const MAX_BODY_BYTES = 16_384;

function vercelGeo(raw: string | null): string {
	if (raw === null || raw === '') return '';
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
}

function errorResponse(
	error: 'analytics_unavailable' | 'analytics_misconfigured' | 'analytics_oversized',
	status: 413 | 503
): Response {
	console.warn(`[analytics] ${error}`);
	return new Response(JSON.stringify({ error }), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

async function readBoundedBody(request: Request): Promise<ArrayBuffer | null> {
	const contentLength = request.headers.get('content-length');
	if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) return null;

	if (request.body === null) return new ArrayBuffer(0);
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > MAX_BODY_BYTES) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}

	const body = new ArrayBuffer(size);
	const bytes = new Uint8Array(body);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return body;
}

export const POST: RequestHandler = async ({ request }) => {
	const relayToken = env.RELAY_TOKEN;
	if (relayToken === undefined || relayToken === '') {
		return errorResponse('analytics_misconfigured', 503);
	}

	let body: ArrayBuffer | null;
	try {
		body = await readBoundedBody(request);
	} catch {
		return errorResponse('analytics_unavailable', 503);
	}
	if (body === null) return errorResponse('analytics_oversized', 413);

	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
	try {
		const headers = new Headers({
			'content-type': request.headers.get('content-type') ?? 'text/plain;charset=UTF-8',
			'x-relay-token': relayToken,
			'x-relay-ua': request.headers.get('user-agent') ?? '',
			'x-relay-country': request.headers.get('x-vercel-ip-country') ?? '',
			'x-relay-city': vercelGeo(request.headers.get('x-vercel-ip-city'))
		});
		if (ip !== null) headers.set('x-relay-ip', ip);
		const response = await fetch(RELAY_URL, {
			method: 'POST',
			headers,
			body,
			signal: AbortSignal.timeout(1500)
		});

		// The collector refuses bots, automation and shielded traffic on purpose.
		// That is its decision, not the visitor's problem, so the page gets the
		// same 202 the Cloudflare proxies give (they relay in the background and
		// never wait for the answer). Before this, every refused bot visit printed
		// a 400 in the browser console. The status is still logged here.
		if (response.status !== 202) console.warn(`[analytics] relay answered ${response.status}`);
	} catch {
		// Same reasoning: a slow or unreachable collector is logged, not surfaced.
		console.warn('[analytics] relay unreachable');
	}
	return new Response(null, { status: 202 });
};

export const GET: RequestHandler = async () =>
	new Response(JSON.stringify({ error: 'method_not_allowed' }), {
		status: 405,
		headers: { 'content-type': 'application/json', Allow: 'POST' }
	});
