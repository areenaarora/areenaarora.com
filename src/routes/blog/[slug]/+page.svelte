<script lang="ts">
	import { marked, type Tokens } from 'marked';

	export let data: {
		slug: string;
		meta: { title: string; date?: string; description?: string };
		content: string;
	};

	const renderer = new marked.Renderer();

	// Marked v12+ signature; note the `this` typing.
	renderer.link = function (this: any, { href, title, tokens }: Tokens.Link) {
		const text = this.parser.parseInline(tokens ?? []);
		const t = title ? ` title="${title}"` : '';
		return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
	};

	const html = marked.parse(data.content, { renderer });
</script>

<article class="blog">
	<h1 class="title">{data.meta.title}</h1>
	{#if data.meta.date}
		<p class="date">{data.meta.date}</p>
	{/if}

	<div class="content">
		{@html html}
	</div>
</article>

<style>
	/* Descendants inside {@html} must be global so Svelte doesn't warn */
	.content :global(p) {
		margin: 1.2rem 0;
	}
	.content :global(a) {
		color: #0645ad;
		text-decoration: underline;
	}
	.content :global(h2),
	.content :global(h3),
	.content :global(h4) {
		margin: 2.2rem 0 0.8rem;
		line-height: 1.3;
	}
	.content :global(ul),
	.content :global(ol) {
		padding-left: 1.4rem;
		margin: 1rem 0;
	}
	.content :global(blockquote) {
		margin: 1.5rem 0;
		padding: 0.75rem 1rem;
		border-left: 4px solid #ddd;
		background: #fafafa;
		color: #222222;
	}
	.content :global(img),
	.content :global(video) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 1.5rem auto;
	}

	.blog {
		max-width: 820px;
		margin: 4rem auto 6rem;
		padding: 0 1rem;
		line-height: 1.8;
		font-size: 1.6rem;
		font-weight: 500;
	}

	.title {
		font-size: 2.3rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		text-align: center;
		margin: 0 0 0.5rem 0;
		color: #242424;
	}

	.date {
		text-align: center;
		color: #000000;
		font-size: 0.95rem;
		margin: 0 0 2.5rem 0;
	}
</style>
