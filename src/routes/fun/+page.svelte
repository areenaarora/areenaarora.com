<svelte:head>
	<title>Fun Experiments</title>
	<meta
		name="description"
		content="Playful ideas, tiny games, and interactive experiments for storytelling mechanics."
	/>
</svelte:head>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllPosts, type PostListItem } from '$lib/posts';

	type Status = 'live' | 'building' | 'archive';
	type Kind = 'game' | 'ui' | 'story' | 'tool';
	type Difficulty = 'easy' | 'medium' | 'hard';

	type Experiment = {
		title: string;
		summary: string;
		status: Status;
		kind: Kind;
		difficulty: Difficulty;
		tech: string[];
		year: number;
		link?: string;
	};

	type BookShowcase = {
		title: string;
		author: string;
		isbn: string;
		link: string;
		coverImage?: string;
	};

	type HeroSlab = {
		label: 'I recently read and 🩷ed' | 'I enjoy listening to' | "The next cool thing I'm building is";
		title: string;
		detail: string;
		link: string;
	};

	const funProjects: Experiment[] = [
		{
			title: 'Shut the Box: Jackpot',
			summary:
				'Roll a dice, add the numbers, strategize but ultimately, all you need is luck!',
			status: 'live',
			kind: 'game',
			difficulty: 'medium',
			tech: [],
			year: 2026,
			link: '/fun/jackpot'
		},
		{
			title: 'Fun Desktop Playground',
			summary:
				'Throwback to the good old Windows 98 days. There\'s not much purpose to this one, except go have a little nostalgic fun!',
			status: 'live',
			kind: 'ui',
			difficulty: 'easy',
			tech: [],
			year: 2026,
			link: '/fun/desktop'
		},
		{
			title: 'Tidbits Tracker',
			summary: 'A static snapshot of my signal ingestion + labeling dashboard with latest trends.',
			status: 'live',
			kind: 'tool',
			difficulty: 'easy',
			tech: [],
			year: 2026,
			link: '/fun/tidbits-tracker'
		}
	];

	const currentBook: BookShowcase = {
		title: 'Shattered Lands: Five Partitions and the Making of Modern Asia',
		author: 'Sam Dalrymple',
		isbn: '9781324123798',
		link: 'https://www.goodreads.com/book/show/209455846-shattered-lands',
		coverImage: '/books/shattered-lands.jpg'
	};

	const heroSlabs: HeroSlab[] = [
		{
			label: 'I recently read and 🩷ed',
			title: 'How bad are things?',
			detail: 'Wait But Why',
			link: 'https://waitbutwhy.com/2013/09/how-to-beat-procrastination.html'
		},
		{
			label: 'I enjoy listening to',
			title: 'The Journal',
			detail: 'Latest episodes',
			link: 'https://open.spotify.com/show/0KxdEdeY2Wb3zr28dMlQva?si=c86ff4390b054c8d'
		},
		{
			label: "The next cool thing I'm building is",
			title: 'Built a newspaper-style hero interaction',
			detail: 'Shipped this page redesign and made it responsive.',
			link: '/fun2'
		}
	];

	let blogPosts: PostListItem[] = [];
	let experiments: Experiment[] = [...funProjects];

	const kindList: Kind[] = ['game', 'ui', 'story', 'tool'];


	const preferredOrder = [
		'Tidbits Tracker',
		'Refusing to let the dead rest in pursuit of curated feeds',
		'Shut the Box: Jackpot',
		'Handling large data: Special Intensive Revision of voters in Tamil Nadu, India',
		'Education in America',
		'Fun Desktop Playground'
	];

	const preferredOrderIndex = new Map(preferredOrder.map((title, idx) => [title, idx]));

	let selectedKinds = new Set<Kind>();
	let selectedTech = new Set<string>();
	let bookCoverMissing = false;
	let bookCoverUrl = '';
	let activeBookIsbn = '';

	const toggleSet = <T,>(set: Set<T>, value: T) => {
		const next = new Set(set);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		return next;
	};

	function clearFilters() {
		selectedKinds = new Set();
		selectedTech = new Set();
	}

	const isbnDigits = (isbn: string) => isbn.replaceAll('-', '');
	const getBookCoverProxyUrl = (isbn: string) => `/api/isbn-cover/${isbnDigits(isbn)}`;
	const isExternalLink = (url: string) => /^https?:\/\//.test(url);

	function onBookCoverError() {
		bookCoverMissing = true;
	}

	function isBlogEntry(exp: Experiment): boolean {
		return Boolean(exp.link && exp.link.startsWith('/blog/'));
	}

	function kindLabel(kind: Kind): string {
		return kind === 'story' ? 'blog' : kind;
	}

	function inferYear(date: string): number {
		const y = Number.parseInt(date.slice(0, 4), 10);
		return Number.isFinite(y) ? y : new Date().getFullYear();
	}

	function inferPostStatus(year: number): Status {
		if (year >= 2025) return 'live';
		if (year >= 2023) return 'building';
		return 'archive';
	}

	function mapPostsToExperiments(posts: PostListItem[]): Experiment[] {
		return posts.map((post) => {
			const year = inferYear(post.date);
			return {
				title: post.title,
				summary:
					post.excerpt?.trim() || 'Imported from Blog on /fun. Open this post to read the full piece.',
				status: inferPostStatus(year),
				kind: 'story',
				difficulty: 'easy',
				tech: [],
				year,
				link: `/blog/${post.slug}`
			};
		});
	}

	onMount(() => {
		try {
			blogPosts = getAllPosts();
			experiments = [...funProjects, ...mapPostsToExperiments(blogPosts)];
		} catch (err) {
			console.error('Failed to import /fun blog content:', err);
			experiments = [...funProjects];
		}
	});


	$: allTech = Array.from(new Set(experiments.flatMap((exp) => exp.tech))).sort((a, b) =>
		a.localeCompare(b)
	);

	$: techCounts = Object.fromEntries(
		allTech.map((tech) => [tech, experiments.filter((exp) => exp.tech.includes(tech)).length])
	) as Record<string, number>;

	$: kindCounts = Object.fromEntries(
		kindList.map((kind) => [kind, experiments.filter((exp) => exp.kind === kind).length])
	) as Record<Kind, number>;

	$: filtered = experiments
		.filter((exp) => (selectedKinds.size ? selectedKinds.has(exp.kind) : true))
		.filter((exp) => (selectedTech.size ? exp.tech.some((t) => selectedTech.has(t)) : true));

	$: chronological = [...filtered].sort((a, b) => {
		const ai = preferredOrderIndex.get(a.title);
		const bi = preferredOrderIndex.get(b.title);
		if (ai !== undefined || bi !== undefined) {
			if (ai === undefined) return 1;
			if (bi === undefined) return -1;
			return ai - bi;
		}
		return b.year - a.year || a.title.localeCompare(b.title);
	});

	$: if (isbnDigits(currentBook.isbn) !== activeBookIsbn) {
		activeBookIsbn = isbnDigits(currentBook.isbn);
		bookCoverMissing = false;
		bookCoverUrl = currentBook.coverImage || getBookCoverProxyUrl(currentBook.isbn);
	}
</script>

<main class="fun2">
	<div class="page-grid">
		<aside class="sidebar" aria-label="Currently">
			<h1 class="sidebar-title">Cur<br />rent<br />ly. 🌸</h1>

			<section class="status-item">
				<p class="status-label">Reading</p>
				<a class="media-card" href={currentBook.link} target="_blank" rel="noreferrer">
					{#if bookCoverMissing}
						<div class="cover-art fallback">{currentBook.title}</div>
					{:else}
						<img
							class="cover-art"
							src={bookCoverUrl}
							alt={`Cover of ${currentBook.title} by ${currentBook.author}`}
							loading="lazy"
							on:error={onBookCoverError}
						/>
					{/if}
					<div>
						<p class="media-title">{currentBook.title}</p>
						<p class="media-detail">{currentBook.author}</p>
					</div>
				</a>
			</section>

			<section class="status-item">
				<p class="status-label">Podcast on repeat</p>
				<a class="mini-block" href={heroSlabs[1].link} target="_blank" rel="noreferrer">
					<p class="media-title small">{heroSlabs[1].title}</p>
					<p class="media-detail">{heroSlabs[1].detail}</p>
				</a>
			</section>

			<section class="status-item flowers" aria-label="Flowers">
				<div class="flower-line" aria-hidden="true">🌻🪻🌷</div>
			</section>
		</aside>

		<section class="content" aria-label="Archive and activity">
			<header class="content-header">
				<div>
										<h2>Esperimenti &amp; <em>writing</em></h2>
				</div>
				<button type="button" class="clear-btn" on:click={clearFilters}>Reset filters</button>
			</header>


			<div class="filter-toolbar">
				<div class="pill-row">
					{#each kindList as kind}
						<button
							type="button"
							class="pill"
							class:active={selectedKinds.has(kind)}
							on:click={() => (selectedKinds = toggleSet(selectedKinds, kind))}
						>
							{kindLabel(kind)} ({kindCounts[kind] ?? 0})
						</button>
					{/each}
				</div>

			</div>

			{#if allTech.length}
				<div class="pill-row soft">
					{#each allTech as tech}
						<button
							type="button"
							class="pill"
							class:active={selectedTech.has(tech)}
							on:click={() => (selectedTech = toggleSet(selectedTech, tech))}
						>
							{tech} ({techCounts[tech] ?? 0})
						</button>
					{/each}
				</div>
			{/if}

			{#if chronological.length === 0}
				<p class="empty">No experiments match these filters.</p>
			{:else}
				<div class="cards">
					{#each chronological as exp}
						<article class="card">
							<div class="card-meta">
								<span class={`kind kind-${exp.kind}`}>{kindLabel(exp.kind)}</span>
							</div>
							<h3>{exp.title}</h3>
							<p>{exp.summary}</p>
							<div class="card-footer">
								{#if exp.link}
									<a href={exp.link}>{isBlogEntry(exp) ? 'Read post' : 'Open experiment'}</a>
								{:else}
									<span>In progress</span>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</main>

<style>
	.fun2 {
		overflow-x: hidden;
		--ink: #131313;
		--muted: #565656;
		--line: #d8d8d8;
		--accent: #d9b13b;
		background: transparent;
		color: var(--ink);
		padding: clamp(1rem, 2.5vw, 2rem);
	}

	.page-grid {
		max-width: 1300px;
		width: 100%;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: clamp(1.5rem, 4vw, 4rem);
	}

	.sidebar {
		position: sticky;
		top: 90px;
		height: fit-content;
		padding-right: 1.4rem;
		border-right: 1px solid var(--line);
	}

	.sidebar-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.4rem, 5vw, 4rem);
		line-height: 0.9;
		margin: 0 0 1.8rem;
	}

	.status-item + .status-item {
		margin-top: 1.25rem;
	}

	.status-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 700;
		padding-bottom: 0.3rem;
		margin: 0 0 0.65rem;
		border-bottom: 1px solid var(--line);
	}

	.media-card {
		display: grid;
		grid-template-columns: 74px 1fr;
		gap: 0.7rem;
		text-decoration: none;
		color: inherit;
	}

	.cover-art {
		width: 74px;
		aspect-ratio: 2 / 3;
		object-fit: cover;
		border: 1px solid var(--line);
	}

	.cover-art.fallback {
		display: grid;
		place-items: center;
		font-size: 0.62rem;
		line-height: 1.2;
		padding: 0.4rem;
		text-align: center;
	}

	.media-title {
		margin: 0;
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.05rem;
		line-height: 1.1;
	}

	.media-title.small {
		font-size: 0.98rem;
	}

	.media-detail {
		margin: 0.25rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.mini-block {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.flowers {
		padding-top: 0.5rem;
	}

	.flower-line {
		font-size: clamp(2.4rem, 5vw, 4rem);
		line-height: 0.9;
		text-align: left;
	}

	.content {
		min-width: 0;
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--ink);
	}

	.eyebrow {
		margin: 0;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 700;
	}

	.content-header h2 {
		margin: 0.3rem 0 0;
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.5rem, 2.8vw, 2.3rem);
		line-height: 1.08;
	}

	.clear-btn {
		border: 1px solid var(--ink);
		background: white;
		padding: 0.45rem 0.75rem;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.ticker-wrap {
		overflow-x: hidden;
		max-width: 100%;
		border-bottom: 1px solid var(--line);
		padding: 0.8rem 0;
		margin-bottom: 1rem;
	}

	.track {
		display: inline-flex;
		width: max-content;
		gap: 0.45rem;
		min-width: 200%;
		animation: ticker 28s linear infinite;
	}

	.track span {
		border: 1px solid var(--line);
		padding: 0.25rem 0.55rem;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		white-space: nowrap;
	}

	.filter-toolbar {
		margin-bottom: 0.8rem;
	}

	.filter-toolbar .pill-row {
		margin-bottom: 0;
	}

	label {
		display: grid;
		gap: 0.28rem;
	}

	label span {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input,
	select {
		width: 100%;
		border: 1px solid var(--line);
		background: #fff;
		padding: 0.52rem;
		font: inherit;
	}

	.pill-row {
		display: flex;
		gap: 0.45rem;
		flex-wrap: wrap;
		margin-bottom: 0.55rem;
	}

	.pill {
		border: 1px solid var(--line);
		background: #fff;
		padding: 0.3rem 0.58rem;
		font-size: 0.76rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.pill.active {
		background: var(--ink);
		border-color: var(--ink);
		color: #fff;
	}

	.pill-row.soft .pill.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--ink);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: 1rem;
		margin-top: 0.8rem;
	}

	.card {
		border: 1px solid var(--line);
		padding: 0.95rem;
		height: fit-content;
		background: white;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.card:hover {
		transform: translateY(-2px);
		border-color: var(--ink);
	}

	.card-meta {
		display: flex;
		gap: 0.45rem;
		align-items: center;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.kind {
		padding: 0.16rem 0.42rem;
		border: 1px solid transparent;
		font-weight: 700;
		letter-spacing: 0.07em;
	}

	.kind-game {
		background: #00a7e1;
		border-color: #008fbe;
		color: #fff;
	}

	.kind-story {
		background: #f2404f;
		border-color: #ce3040;
		color: #fff;
	}

	.kind-ui {
		background: #613f75;
		border-color: #4e325f;
		color: #fff;
	}

	.kind-tool {
		background: #285943;
		border-color: #1f4836;
		color: #fff;
	}


	.card h3 {
		overflow-wrap: anywhere;
		margin: 0.55rem 0 0;
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1rem, 1.45vw, 1.35rem);
		line-height: 1.15;
	}

	.card p {
		overflow-wrap: anywhere;
		margin: 0.6rem 0 0;
		font-size: 0.97rem;
		line-height: 1.45;
		color: var(--muted);
	}

	.card-footer {
		margin-top: 0.8rem;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card-footer a {
		color: var(--ink);
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.empty {
		padding: 1rem 0;
		color: var(--muted);
	}

	@keyframes ticker {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 980px) {
		.page-grid {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
			border-right: 0;
			border-bottom: 1px solid var(--line);
			padding: 0 0 1rem;
		}

	}

	@media (max-width: 760px) {
		.cards {
			grid-template-columns: 1fr;
		}

		.content {
		min-width: 0;
	}

	.content-header {
			align-items: start;
			flex-direction: column;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}
	}
</style>
