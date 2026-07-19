<svelte:head>
	<title>Workshops & Talks | Areena Arora</title>
	<meta
		name="description"
		content="Practical workshops on data journalism, information design and visual storytelling by Areena Arora."
	/>
</svelte:head>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { base } from '$app/paths';

	type Workshop = {
		id: string;
		eyebrow: string;
		title: string;
		deck: string;
		pullQuote?: string;
		details: { label: string; value: string }[];
		includes: string[];
		sessions?: string[];
		contextNote?: string;
		links: { label: string; href: string }[];
	};

	const contactLinks = {
		email: 'mailto:areena.arora@columbia.edu',
		linkedin: 'https://www.linkedin.com/in/areena-arora/'
	};

	const speakingBio =
		'Areena Arora is an editorial coder and data journalist at The Hindu. Her work sits at the intersection of reporting, code, information design and visual storytelling. She previously reported on public education in Tennessee and now develops interactive and data-driven journalism in India. She also teaches workshops on mobile-first design, data journalism and visual storytelling.';

	const workshops: Workshop[] = [
		{
			id: 'small-screens',
			eyebrow: 'WORKSHOP 01',
			title: 'Designing for Small Screens',
			deck: 'A hands-on workshop for redesigning desktop data stories for six-inch screens.',
			pullQuote: 'Responsive isn’t the same as designed.',
			details: [
				{ label: 'Audience', value: 'Journalists, designers and newsroom teams' },
				{ label: 'Duration', value: '2 hours' },
				{ label: 'Format', value: 'Hands-on workshop' }
			],
			includes: ['Slides', 'Paper exercises', 'Mobile-first checklist', 'Peer critique'],
			contextNote: 'Originally developed for VizChitra 2026.',
			links: [
				{ label: 'View workshop', href: `${base}/viz-slides/preview.html` },
				// TODO: Replace with the final downloadable VizChitra 2026 slide file.
				{ label: 'Download slides', href: `${base}/downloads/designing-small-screens-slides.pdf` }
			]
		},
		{
			id: 'climate-data',
			eyebrow: 'WORKSHOP 02',
			title: 'Climate Data Journalism',
			deck: 'Using data to find, question and communicate climate stories.',
			details: [
				{ label: 'Audience', value: 'Early-career and senior journalists' },
				{ label: 'Duration', value: '3 × 75 minutes' },
				{ label: 'Format', value: 'Theory, dataset inspection and story development' }
			],
			sessions: [
				'What data journalism can do for climate reporting',
				'Finding and inspecting climate data',
				'Communicating climate evidence clearly'
			],
			includes: ['Slides', 'Sample dataset', 'Reading list', 'Story exercises'],
			links: [
				{ label: 'View workshop', href: `${base}/workshops-and-talks#climate-data` },
				// TODO: Replace with final climate workshop materials.
				{ label: 'Download materials', href: `${base}/downloads/climate-data-journalism-materials.zip` }
			]
		}
	];

	let bioButtonLabel = 'Copy bio';
	let bioTimer: ReturnType<typeof setTimeout> | null = null;

	async function copyBio() {
		try {
			await navigator.clipboard.writeText(speakingBio);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = speakingBio;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'fixed';
			textarea.style.top = '-1000px';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}

		bioButtonLabel = 'Copied';
		if (bioTimer) clearTimeout(bioTimer);
		bioTimer = setTimeout(() => (bioButtonLabel = 'Copy bio'), 1800);
	}

	onDestroy(() => {
		if (bioTimer) clearTimeout(bioTimer);
	});
</script>

<main class="talks-page">
	<div class="page-shell">
		<section class="hero" aria-labelledby="page-title">
			<h1 id="page-title">
				<span>Workshops</span>
				<em>&amp;</em>
				<span>Talks</span>
			</h1>
			<div class="hero-copy">
				<p>I teach workshops on data journalism, information design and visual storytelling.</p>
			</div>
		</section>

		<section class="section-heading" id="workshops" aria-labelledby="workshops-title">
			<h2 id="workshops-title">Workshops</h2>
		</section>

		<section class="workshop-list" aria-label="Current workshops">
			{#each workshops as workshop, i}
				{@const viewLink = workshop.links[0]}
				<article class="workshop-row {workshop.id}" id={workshop.id}>
					<span class="workshop-marker" aria-hidden="true"></span>
					<p class="workshop-number">{String(i + 1).padStart(2, '0')}</p>

					<div class="workshop-summary">
						<a
							class="workshop-title-link"
							href={viewLink.href}
							target={viewLink.href.includes('/viz-slides/') || viewLink.href.startsWith('http') ? '_blank' : undefined}
							rel={viewLink.href.includes('/viz-slides/') || viewLink.href.startsWith('http') ? 'noreferrer' : undefined}
							aria-label={`View ${workshop.title} workshop`}
						>
							<h3>{workshop.title}</h3>
						</a>
						<p class="deck">{workshop.deck}</p>
					</div>

					{#each workshop.details as item}
						<div class="workshop-meta">
							<p>{item.label}</p>
							<span>{item.value}</span>
						</div>
					{/each}

					<div class="workshop-includes">
						<p>Includes</p>
						<ul>
							{#each workshop.includes as item}
								<li><span aria-hidden="true"></span>{item}</li>
							{/each}
						</ul>
					</div>

				</article>
			{/each}
		</section>

		<section class="bio-contact-grid" aria-label="Speaker bio and contact">
			<article class="bio-card">
				<h2>Speaker bio</h2>
				<p>{speakingBio}</p>
				<div class="bio-actions">
					<button type="button" on:click={copyBio} aria-live="polite">{bioButtonLabel}</button>
				</div>
			</article>

			<section class="contact-card" id="contact" aria-labelledby="contact-title">
				<p class="contact-label"><span aria-hidden="true"></span>Contact</p>
				<div class="contact-content">
					<h2 id="contact-title">Interested in bringing one of these workshops to your newsroom, classroom or conference?</h2>
					<div class="contact-actions">
						<a href={contactLinks.email}>Email me <span aria-hidden="true">→</span></a>
						<a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer"
							>LinkedIn <span aria-hidden="true">→</span></a
						>
						<a href="https://calendly.com/areena-arora/30min" target="_blank" rel="noopener noreferrer"
							>Book a virtual meeting <span aria-hidden="true">→</span></a
						>
					</div>
				</div>
			</section>
		</section>
	</div>
</main>

<style>
	.talks-page {
		--ink: #111;
		--muted: #4f4f4f;
		--line: #171717;
		--soft-line: #d7d7d7;
		--paper: #fffdf8;
		--paper-cool: #f8fbff;
		--pink: #f4b4c3;
		--blue: #4f79d9;
		--green: #6b8f71;
		--yellow: #f1d36b;
		--outer-gap: clamp(3rem, 7vw, 6rem);
		--inner-gap: clamp(1.25rem, 3vw, 2rem);
		padding-block: clamp(2rem, 5vw, 4.5rem) 4rem;
		color: var(--ink);
		overflow-x: hidden;
	}

	.page-shell {
		width: min(100% - 2rem, 1380px);
		margin-inline: auto;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	a,
	button {
		font: inherit;
		color: inherit;
	}

	.hero,
	.section-heading,
	.workshop-list,
	.bio-contact-grid {
		width: 100%;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 7fr) minmax(280px, 4fr);
		gap: var(--inner-gap);
		align-items: end;
		min-height: min(60vh, 580px);
		padding: clamp(3rem, 8vw, 7rem) 0 clamp(2rem, 5vw, 4rem);
	}

	h1 {
		max-width: 9ch;
		font-size: clamp(4.4rem, 13vw, 10.5rem);
		font-weight: 600;
		line-height: 0.82;
		letter-spacing: 0;
	}

	h1 span {
		color: #F2414F;
	}

	h1 em {
		color: var(--ink);
		font-style: normal;
	}

	h2 {
		font-size: clamp(2.1rem, 5vw, 4.8rem);
		font-weight: 600;
		line-height: 0.96;
		letter-spacing: 0;
	}

	#workshops-title {
		font-size: 34px;
	}

	h3 {
		font-size: clamp(1.2rem, 2.4vw, 2.2rem);
		font-weight: 600;
		line-height: 0.95;
		letter-spacing: 0;
	}

	.kicker {
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.72rem;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.hero-copy {
		display: grid;
		gap: 1rem;
		max-width: 38ch;
		font-size: clamp(calc(1.35rem - 2px), calc(2.2vw - 2px), calc(2.1rem - 2px));
		line-height: 1.15;
	}

	.bio-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem 1rem;
		align-items: baseline;
	}

	.bio-actions a,
	.bio-actions button {
		border: 1px solid var(--line);
		background: #fff;
		padding: 0.55rem 0.8rem;
		text-decoration: none;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.82rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
	}

	.bio-actions a:hover,
	.bio-actions button:hover {
		background: #f6f6f6;
		border-color: #000;
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
	}

	.bio-actions a:focus-visible,
	.bio-actions button:focus-visible {
		outline: 2px solid #000dff;
		outline-offset: 3px;
	}

	.section-heading {
		display: grid;
		gap: 0.65rem;
		margin: var(--outer-gap) 0 clamp(1.5rem, 4vw, 3rem);
	}

	.section-heading.compact {
		margin-top: 0;
	}

	.workshop-list {
		border-top: 1px solid var(--line);
	}

	.workshop-row {
		--accent: var(--pink);
		display: grid;
		grid-template-columns:
			12px
			44px
			minmax(250px, 2.25fr)
			minmax(132px, 0.95fr)
			minmax(84px, 0.6fr)
			minmax(136px, 0.95fr)
			minmax(170px, 1.15fr);
		gap: clamp(0.8rem, 1.5vw, 1.35rem);
		align-items: start;
		padding: clamp(1.05rem, 2.2vw, 1.55rem) 0;
		border-bottom: 1px solid var(--soft-line);
		transition: background 0.18s ease, border-color 0.18s ease;
	}

	.workshop-row:hover,
	.workshop-row:focus-within {
		background: color-mix(in srgb, var(--accent) 9%, transparent);
		border-bottom-color: var(--line);
	}

	.workshop-row:hover h3,
	.workshop-row:focus-within h3 {
		text-decoration-color: var(--accent);
	}

	.workshop-row.climate-data {
		--accent: var(--green);
	}

	.workshop-marker {
		display: block;
		width: 0.58rem;
		height: 0.58rem;
		margin-top: 0.3rem;
		background: var(--accent);
		border: 1px solid var(--line);
	}

	.workshop-number,
	.workshop-meta p,
	.workshop-includes p {
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.7rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.workshop-number {
		color: var(--ink);
		letter-spacing: 0.08em;
	}

	.workshop-summary {
		padding-right: clamp(0.5rem, 1.2vw, 1.1rem);
		border-right: 1px dotted var(--soft-line);
	}

	.workshop-title-link {
		display: inline-block;
		text-decoration: none;
	}

	.workshop-title-link h3 {
		font-size: clamp(1.45rem, 2.15vw, 1.9rem);
		line-height: 1;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.12em;
		transition: text-decoration-color 0.18s ease;
	}

	.deck {
		margin-top: 0.45rem;
		max-width: 42ch;
		font-size: clamp(0.95rem, 1.15vw, 1.04rem);
		line-height: 1.28;
		color: #202020;
	}

	.workshop-meta {
		display: grid;
		gap: 0.35rem;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
	}

	.workshop-meta span {
		font-size: clamp(0.85rem, 1vw, 0.95rem);
		line-height: 1.25;
	}

	.workshop-includes {
		display: grid;
		gap: 0.45rem;
		padding-left: clamp(0.5rem, 1vw, 1rem);
		border-left: 1px dotted var(--soft-line);
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
	}

	.workshop-includes ul {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.workshop-includes li {
		display: grid;
		grid-template-columns: 0.9rem 1fr;
		gap: 0.45rem;
		align-items: start;
		font-size: clamp(0.82rem, 0.95vw, 0.92rem);
		line-height: 1.2;
	}

	.workshop-includes li span {
		width: 0.72rem;
		height: 0.72rem;
		margin-top: 0.12rem;
		border: 1px solid var(--line);
		background: linear-gradient(135deg, transparent 45%, var(--accent) 45%, var(--accent) 58%, transparent 58%);
	}

	.workshop-title-link:focus-visible {
		outline: 2px solid #000dff;
		outline-offset: 3px;
	}

	.bio-contact-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		gap: var(--inner-gap);
		align-items: start;
		margin-top: var(--outer-gap);
	}

	.bio-card {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--inner-gap);
		align-items: start;
	}

	.bio-card h2 {
		margin-top: 0.55rem;
		font-size: clamp(1.9rem, 4vw, 3.5rem);
	}

	.bio-card > p:not(.kicker) {
		max-width: 64ch;
		font-size: clamp(1.08rem, 1.5vw, 1.28rem);
		line-height: 1.35;
	}

	.bio-actions {
		margin-top: 1.3rem;
	}

	.contact-card {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.1rem;
		align-items: start;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--soft-line);
		padding: clamp(2.4rem, 4vw, 3.5rem) 0;
	}

	.contact-card h2 {
		max-width: 900px;
		font-size: clamp(1.45rem, 2.15vw, 1.9rem);
		line-height: 1;
	}

	.contact-label {
		display: flex;
		gap: 0.55rem;
		align-items: center;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.72rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.contact-label span {
		width: 0.55rem;
		height: 0.55rem;
		background: var(--pink);
		border: 1px solid var(--line);
	}

	.contact-content {
		display: grid;
		gap: 1.1rem;
	}

	.contact-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem 1.4rem;
		align-items: baseline;
		margin-top: 0;
	}

	.contact-actions a {
		border-bottom: 1px solid currentColor;
		text-decoration: none;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 0.78rem;
		font-weight: 800;
		line-height: 1.35;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: border-color 0.18s ease, color 0.18s ease;
	}

	.contact-actions a:focus-visible {
		outline: 2px solid #000dff;
		outline-offset: 3px;
	}

	.contact-actions a span {
		display: inline-block;
		transition: transform 0.18s ease;
	}

	.contact-actions a:hover {
		color: #000;
		border-color: #000;
	}

	.contact-actions a:hover span,
	.contact-actions a:focus-visible span {
		transform: translateX(3px);
	}

	@media (max-width: 980px) {
		.hero,
		.bio-contact-grid,
		.bio-card,
		.contact-card {
			grid-template-columns: 1fr;
		}

		.hero {
			min-height: auto;
		}

		.workshop-row {
			grid-template-columns: 12px 40px minmax(0, 1fr) minmax(140px, 0.75fr);
		}

		.workshop-meta {
			grid-column: 3 / 4;
			grid-template-columns: 7.5rem minmax(0, 1fr);
			align-items: baseline;
		}

		.workshop-includes {
			grid-column: 4 / 5;
			grid-row: 2 / span 3;
		}

	}

	@media (max-width: 720px) {
		.talks-page {
			padding-top: 2rem;
		}

		h1 {
			font-size: clamp(3.4rem, 18vw, 5.5rem);
		}

		.workshop-row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
			padding: 1.25rem 0;
		}

		.workshop-marker {
			width: 100%;
			height: 0.35rem;
			margin-top: 0;
		}

		.workshop-summary,
		.workshop-includes {
			padding: 0;
			border: 0;
		}

		.workshop-meta,
		.workshop-includes {
			grid-column: auto;
			grid-row: auto;
		}

		.workshop-meta {
			grid-template-columns: 6.75rem minmax(0, 1fr);
		}

		.contact-card {
			grid-template-columns: 1fr;
			padding: 3.5rem 0;
		}

		.contact-card h2 {
			font-size: clamp(1.45rem, 2.15vw, 1.9rem);
			line-height: 1;
		}

		.bio-actions,
		.contact-actions {
			align-items: flex-start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none;
			scroll-behavior: auto;
		}
	}
</style>
