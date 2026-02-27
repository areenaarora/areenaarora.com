import type { RequestHandler } from './$types';

const imageHeaders = {
	'cache-control': 'public, max-age=86400, s-maxage=86400'
};

const isbnDigits = (isbn: string) => isbn.replace(/[^0-9Xx]/g, '').toUpperCase();

async function fetchImage(url: string): Promise<Response | null> {
	try {
		const res = await fetch(url, {
			headers: {
				accept: 'image/*,*/*;q=0.8',
				'user-agent': 'areenaarora-com/isbn-cover'
			}
		});
		if (!res.ok) return null;
		const ct = res.headers.get('content-type') ?? '';
		if (!ct.startsWith('image/')) return null;
		return res;
	} catch {
		return null;
	}
}

async function getGoogleApiImageUrl(clean: string): Promise<string | null> {
	try {
		const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`);
		if (!res.ok) return null;
		const data = await res.json();
		const links = data?.items?.[0]?.volumeInfo?.imageLinks;
		const raw = links?.large || links?.medium || links?.small || links?.thumbnail || links?.smallThumbnail;
		if (!raw || typeof raw !== 'string') return null;
		return raw.replace(/^http:\/\//, 'https://');
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const clean = isbnDigits(params.isbn);
	if (!clean) {
		return new Response('Invalid ISBN', { status: 400 });
	}

	const staticCandidates = [
		`https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`,
		`https://books.google.com/books/content?vid=ISBN${clean}&printsec=frontcover&img=1&zoom=2&edge=curl&source=gbs_api`
	];

	for (const url of staticCandidates) {
		const imageRes = await fetchImage(url);
		if (!imageRes) continue;
		return new Response(imageRes.body, {
			status: 200,
			headers: {
				'content-type': imageRes.headers.get('content-type') ?? 'image/jpeg',
				...imageHeaders
			}
		});
	}

	const googleApiUrl = await getGoogleApiImageUrl(clean);
	if (googleApiUrl) {
		const imageRes = await fetchImage(googleApiUrl);
		if (imageRes) {
			return new Response(imageRes.body, {
				status: 200,
				headers: {
					'content-type': imageRes.headers.get('content-type') ?? 'image/jpeg',
					...imageHeaders
				}
			});
		}
	}

	return new Response('No cover found', {
		status: 404,
		headers: imageHeaders
	});
};
