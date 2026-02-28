<script lang="ts">
	import { onMount } from 'svelte';
	import { marked, type Tokens } from 'marked';

	export let data: {
		slug: string;
		meta: { title: string; date?: string; description?: string };
		content: string;
		readTimeMinutes: number;
		related: { slug: string; title: string; date?: string; description?: string }[];
	};

	const renderer = new marked.Renderer();
	renderer.link = function (this: any, { href, title, tokens }: Tokens.Link) {
		const text = this.parser.parseInline(tokens ?? []);
		const t = title ? ` title="${title}"` : '';
		return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`;
	};

	const html = marked.parse(data.content, { renderer });

	const fmt = (iso?: string) => {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
	};

	let progress = 0;

	onMount(() => {
		const updateProgress = () => {
			const y = window.scrollY;
			const h = document.documentElement.scrollHeight - window.innerHeight;
			progress = h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0;
		};

		updateProgress();
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
		return () => {
			window.removeEventListener('scroll', updateProgress);
			window.removeEventListener('resize', updateProgress);
		};
	});
</script>

<div class="read-progress" aria-hidden="true">
	<span style={`width:${progress}%`}></span>
</div>

<main class="story-layout">
	<article class="story">
		<div class="meta-row">
			{#if data.meta.date}
				<time datetime={data.meta.date}>{fmt(data.meta.date)}</time>
			{/if}
			<span class="dot"></span>
			<span>{data.readTimeMinutes} min read</span>
		</div>

		<h1 class="title">{data.meta.title}</h1>
		{#if data.meta.description}
			<p class="dek">{data.meta.description}</p>
		{/if}

		<div class="content">
			{@html html}
		</div>
	</article>

	<aside class="rail" aria-label="Related articles">
		<section class="rail-card">
			<h2>Related articles</h2>
			<ul>
				{#each data.related as item}
					<li>
						<a href={`/blog/${item.slug}`}>{item.title}</a>
						{#if item.date}
							<time datetime={item.date}>{fmt(item.date)}</time>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	</aside>
</main>

<style>
	.read-progress {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: rgba(0, 0, 0, 0.08);
		z-index: 50;
	}

	.read-progress span {
		display: block;
		height: 100%;
		background: #111;
		transition: width 0.08s linear;
	}

	.story-layout {
		max-width: 1280px;
		margin: 2.8rem auto 5rem;
		padding: 0 1.25rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: 2.2rem;
	}

	.story {
		min-width: 0;
		padding-right: 1.5rem;
		border-right: 1px solid rgba(0, 0, 0, 0.1);
	}

	.meta-row {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #5e6675;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.dot {
		width: 4px;
		height: 4px;
		background: #c3c8d1;
		border-radius: 50%;
	}

	.title {
		font-size: clamp(2.35rem, 6vw, 5.5rem);
		line-height: 0.98;
		letter-spacing: -0.01em;
		margin: 0;
		color: #111;
	}

	.dek {
		margin: 1.6rem 0 2rem;
		font-size: clamp(1.18rem, 2vw, 1.7rem);
		line-height: 1.35;
		font-style: italic;
		color: #374154;
		max-width: 90%;
		border-left: 4px solid #e9bf2f;
		padding-left: 1rem;
	}

	.content {
		font-size: clamp(1.08rem, 1.4vw, 1.32rem);
		line-height: 1.8;
		max-width: 40em;
	}

	.content :global(p) {
		margin: 1.25rem 0;
	}

	.content :global(a) {
		color: #0645ad;
		text-decoration: underline;
	}

	.content :global(h2),
	.content :global(h3),
	.content :global(h4) {
		margin: 2.2rem 0 0.9rem;
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
		color: #222;
	}

	.content :global(img),
	.content :global(video) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 1.5rem auto;
	}

	.rail {
		position: relative;
	}

	.rail-card {
		position: sticky;
		top: 5.5rem;
		padding: 1rem 1rem 1.15rem;
		border: 1px solid rgba(0, 0, 0, 0.12);
		background: #fff;
	}

	.rail-card h2 {
		font-size: 1.6rem;
		margin: 0 0 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #111;
	}

	.rail-card ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.rail-card li + li {
		padding-top: 0.85rem;
		margin-top: 0.85rem;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
	}

	.rail-card a {
		font-weight: 700;
		line-height: 1.35;
		text-decoration: none;
	}

	.rail-card a:hover {
		text-decoration: underline;
	}

	.rail-card time {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.8rem;
		color: #6f7480;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	@media (max-width: 980px) {
		.story-layout {
			grid-template-columns: 1fr;
			gap: 1.3rem;
		}

		.story {
			border-right: 0;
			padding-right: 0;
		}

		.dek {
			max-width: 100%;
		}

		.rail-card {
			position: static;
		}
	}
</style>
