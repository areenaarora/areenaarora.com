export async function GET({ fetch }) {
	const response = await fetch('/viz-slides_/index.html');
	const html = await response.text();

	return new Response(html, {
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
}
