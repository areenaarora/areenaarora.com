/*
 * Plausible compact-payload translation for the first-party event proxy.
 * Pure functions only — no request handling, so they stay unit-testable.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Plausible props allow primitives; the collector requires string values. */
function stringProps(value: unknown): Record<string, string> | null {
	if (!isRecord(value)) return null;
	const out: Record<string, string> = {};
	for (const [key, val] of Object.entries(value)) {
		if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
			out[key] = String(val);
		}
	}
	return Object.keys(out).length > 0 ? out : null;
}

/**
 * Map the tracker's compact payload (n/u/d/r/p/e/sd/i) onto the collector's
 * long-key format. The domain (d) is dropped — the collector derives the
 * hostname from the URL. Unknown event names become custom events. Props are
 * only forwarded for custom events, because the collector rejects properties
 * on pageview and engagement (properties_not_allowed).
 */
export function translateCompactPayload(parsed: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	const name = typeof parsed.n === 'string' ? parsed.n : '';
	const isCustom = name !== 'pageview' && name !== 'engagement';
	if (isCustom) {
		out.name = 'custom';
		out.event_name = name;
	} else {
		out.name = name;
	}
	if (typeof parsed.u === 'string') out.url = parsed.u;
	if (typeof parsed.r === 'string' || parsed.r === null) out.referrer = parsed.r;
	if (isCustom) {
		const props = stringProps(parsed.p);
		if (props !== null) out.props = props;
	}
	if (typeof parsed.e === 'number') out.engagement_ms = parsed.e;
	if (typeof parsed.sd === 'number') out.scroll_depth = parsed.sd;
	if (parsed.i === false) out.interactive = false;
	return out;
}

/**
 * Build the collector-format relay body. The envelope fields are synthesized
 * here because the tracker never sends them. A non-JSON body passes through
 * untouched so the relay — not this route — decides to reject it.
 */
export function buildRelayBody(bodyText: string, eventId?: string): string {
	let parsed: unknown;
	try {
		parsed = JSON.parse(bodyText);
	} catch {
		return bodyText;
	}
	if (!isRecord(parsed)) return bodyText;
	const translated =
		typeof parsed.n === 'string' && parsed.url === undefined && parsed.name === undefined
			? translateCompactPayload(parsed)
			: parsed;
	return JSON.stringify({
		schema_version: 1,
		event_id: eventId ?? crypto.randomUUID().replaceAll('-', ''),
		wd: false,
		...translated
	});
}
