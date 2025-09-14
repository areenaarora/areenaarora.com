<script lang="ts">
	export let data: {
		posts: { slug: string; title: string; date?: string; description?: string }[];
	};

	const fmt = (iso?: string) => {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
	};
</script>

<main class="page">
	<section class="main">
		<h1 class="title">Writing</h1>
		<p class="dek">Notes on data work, interactives, and newsroom tinkering.</p>

		<ul class="post-list">
			{#each data.posts as p}
				<li class="post">
					<a class="post-title" href={`/blog/${p.slug}`}>{p.title}</a>
					{#if p.date}
						<time class="post-date" datetime={p.date}>{fmt(p.date)}</time>
					{/if}
					{#if p.description}
						<p class="post-desc">{p.description}</p>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<aside class="side">
		<section class="card">
			<h2 class="tab">About this blog</h2>
			<div class="card-body">
				<p>
					Occasional posts on reporting with code, data viz, and the messy bits that don’t make it
					into the final pieces.
				</p>
			</div>
		</section>

		<section class="card">
			<h2 class="tab">Links</h2>
			<div class="card-body">
				<ul class="links">
					<li><a href="mailto:areena.arora@columbia.edu">Email</a></li>
					<li>
						<a href="https://github.com/areenaarora" target="_blank" rel="noopener noreferrer"
							>GitHub</a
						>
					</li>
					<li>
						<a
							href="https://www.linkedin.com/in/areena-arora/"
							target="_blank"
							rel="noopener noreferrer">LinkedIn</a
						>
					</li>
					<li>
						<a href="https://x.com/AreenaArora" target="_blank" rel="noopener noreferrer">X</a>
					</li>
				</ul>
			</div>
		</section>
	</aside>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.25rem 4rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: 2rem;
	}
	@media (max-width: 900px) {
		.page {
			grid-template-columns: 1fr;
		}
		.side {
			order: -1;
		}
	}

	.title {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 3rem;
		line-height: 1.1;
		margin: 0 0 0.75rem 0;
	}
	.dek {
		font-size: 1.125rem;
		margin: 0 0 2rem 0;
	}

	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.post {
		padding: 1.1rem 0;
	}
	.post + .post {
		border-top: 1px solid rgba(0, 0, 0, 0.08);
	}

	.post-title {
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.post-date {
		display: block;
		font-size: 0.95rem;
		opacity: 0.7;
		margin-top: 0.25rem;
	}
	.post-desc {
		margin: 0.4rem 0 0 0;
	}

	.card {
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 1rem;
	}
	.tab {
		font-size: 1.05rem;
		font-weight: 700;
		margin: 0;
		padding: 0.85rem 1rem 0.5rem;
		border-bottom: 2px solid #000dff; /* match About accent */
		width: max-content;
	}
	.card-body {
		padding: 0.9rem 1rem 1.1rem;
	}
	.links {
		margin: 0.25rem 0 0 1rem;
	}
</style>
