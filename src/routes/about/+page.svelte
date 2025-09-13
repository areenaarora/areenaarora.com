<script lang="ts">
	// Toggle between views
	let view: 'about' | 'resume' = 'about';
	import { base } from '$app/paths';
	import { onDestroy } from 'svelte';

	// Colors / tokens
	const BLUE = '#000dff';

	// External links (open in new tab everywhere)
	const links = {
		emailHref: 'mailto:areena.arora@columbia.edu',
		emailTextObfuscated: 'areena [dot] arora [at] columbia [dot] edu',
		github: 'https://github.com/areenaarora',
		linkedin: 'https://www.linkedin.com/in/areena-arora/',
		twitter: 'https://x.com/AreenaArora'
	};

	// Selected projects (resume)
	const projects = [
		{
			title: 'Heat stress in Chennai',
			url: 'https://www.thehindu.com/infographics/2025-07-12/heat-stress-in-chennai/index.html',
			dek: 'Interactive on how heat & humidity affect people differently.'
		},
		{
			title: 'Private fundraising makes public schools unequal',
			url: 'https://www.knoxnews.com/story/news/education/2024/04/23/knox-county-schools-foundations-boost-some-but-others-are-left-out/73417988007/',
			dek: 'Used nonprofit data to quantify gaps.'
		},
		{
			title: 'Police chief searches: digging past the claim',
			url: 'https://www.knoxnews.com/story/news/local/2022/11/16/knoxville-police-chief-data-blows-up-claim-about-secret-searches/69614670007/',
			dek: 'Built a database disproving an official statement.'
		}
	];

	/* ---- copy-to-clipboard for email ---- */
	let copied = false;
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	async function copyEmail() {
		const addr = links.emailHref.replace(/^mailto:/, '');

		try {
			await navigator.clipboard.writeText(addr);
		} catch {
			// fallback for older/iOS Safari
			const ta = document.createElement('textarea');
			ta.value = addr;
			ta.setAttribute('readonly', '');
			ta.style.position = 'fixed';
			ta.style.top = '-1000px';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
		}

		copied = true;
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}

	onDestroy(() => {
		if (copyTimer) clearTimeout(copyTimer);
	});
</script>

<section class="wrap">
	<header class="titlebar">
		<h1 class="page-title">Areena Arora</h1>

		<div class="tabs">
			<button
				class="tab {view === 'about' ? 'is-active' : ''}"
				on:click={() => (view = 'about')}
				aria-pressed={view === 'about'}
			>
				About
			</button>
			<button
				class="tab {view === 'resume' ? 'is-active' : ''}"
				on:click={() => (view = 'resume')}
				aria-pressed={view === 'resume'}
			>
				View résumé
			</button>
		</div>
	</header>

	{#if view === 'about'}
		<!-- ABOUT VIEW -->
		<div class="about-grid">
			<div class="about-copy">
				<p>
					I’m the first-ever Editorial Coder at <a
						href="https://www.thehindu.com/"
						target="_blank"
						class="blue_links">The Hindu.</a
					> I clean and shape messy datasets to uncover patterns that add context to the news, then design
					interactives that make those stories engaging, without distracting from the core narrative.
				</p>

				<p>
					Before this, I was a data and investigative reporter covering public education at
					<a href="www.knoxnews.com" target="blank" class="blue_links">Knox News,</a> a Gannett-owned
					local newspaper in Knoxville, Tennessee.
				</p>
				<p>
					Covering public schools was truly rewarding, and hopefully, someday (soon), I'll write a
					book about how America educates its kids and what I’ve learned, liked and wrestled with.
				</p>
				<p>
					Lately, I’ve also been diving into the evolution of the news and information industry, and
					the intersection of generative AI, ethics, and journalism. I love exploring tools that
					make reporting easier.
				</p>
				<p>
					I have a master’s degree in Data Journalism from <a
						href="https://journalism.columbia.edu/ms-data-journalism"
						target="_blank"
						class="blue_links">Columbia University</a
					> where I took classes in environmental reporting, algorithms and mapping, among other courses.
					I’ve also worked as a city beat reporter for a local newsroom in Idaho, worked for Reuters
					as a publisher and as an editor at a media start-up.
				</p>
				<p>
					For visualization, I’m trained in making interactives with Python libraires such as Altair
					and Plotly and D3. I enjoy mapping with QGIS, Mapbox and Google Earth Pro. For quick
					turnarounds, I also rely on free resources such as Datawrapper and Flourish.
				</p>
				<p>
					I once wrote a <a href="https://areena.substack.com/" target="_blank" class="blue_links">
						newsletter about life in NYC and grad school.</a
					> Outside of all things news, I'm a house-plant enthusiast and love to travel — as often as
					I can. Earlier this year, my husband and I traveled to Peru and I promise you, Machu Picchu
					is every bit worth the hype and then some!
				</p>
				<h2>A note of thanks :')</h2>
				<p>
					This website was made possible thanks to a bunch of people and wonderful resources on the
					internet. Here's naming a few tools/resources I used. Thanks to:
				</p>
				<ul>
					<li>
						My husband <a href="https://sreetamdas.com/" target="_blank" class="blue_links"
							>Sreetam Das'</a
						> consistent badgering me to actually make the website.
					</li>
					<li>I vibe coded a lot of it, so thanks to the good folks at OpenAI.</li>
					<li>Adobe Illustrator, where I sketched out the minimal design bits.</li>
					<li>
						<a
							href="https://archive.org/details/bliss_uncropped_8k"
							target="_blank"
							class="blue_links">Internet archive</a
						> for the good old Windows' Bliss wallpaper image.
					</li>
					<li>
						In no particular order of importance, I found design inspiration from: <a
							href="https://alantrotter.com/"
							target="_blank"
							class="blue_links"
						>
							Alan Trotter,</a
						> <a href="https://www.nicchan.me/" target="_blank" class="blue_links"> Nic Chan,</a>
						<a href="https://windows96.net/" target="_blank" class="blue_links"> Windows 96</a> and
						<a href="https://lisacharlottemuth.com" target="_blank" class="blue_links">
							Lisa Charlotte Muth.</a
						>
					</li>
					<li>
						<a href="https://win98icons.alexmeub.com/" target="_blank" class="blue_links"
							>Win98icons</a
						> for well, the icons on the fun page.
					</li>
				</ul>
			</div>

			<aside class="about-side">
				<div class="card">
					<h3 class="card-title">Where</h3>
					<p>Based in Chennai</p>
					<p class="email-line">
						Reach me at <strong class="email">{links.emailTextObfuscated}</strong>
						<button
							type="button"
							class="copy-btn {copied ? 'is-copied' : ''}"
							on:click={copyEmail}
							aria-label={copied ? 'Email copied to clipboard' : 'Copy email to clipboard'}
						>
							<svg class="clip" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
								<path
									d="M9 3h6a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2-2z"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								/>
								<rect x="8" y="3" width="8" height="4" rx="1.5" fill="currentColor" opacity=".15" />
							</svg>
							<span>{copied ? 'Copied!' : 'Click to copy'}</span>
						</button>.
					</p>
				</div>

				<div class="card">
					<h3 class="card-title">Links</h3>
					<ul class="linklist">
						<li><a href={links.emailHref} target="_blank" rel="noopener noreferrer">Email</a></li>
						<li><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
						<li><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
						<li><a href={links.twitter} target="_blank" rel="noopener noreferrer">X</a></li>
					</ul>
				</div>
			</aside>
		</div>
	{:else}
		<!-- RESUME VIEW -->
		<div class="resume">
			<p class="kicker">Data journalist, information designer</p>

			<div class="res-grid">
				<!-- LEFT: Experience + Awards -->
				<div class="col">
					<h2 class="res-h">Experience</h2>

					<article class="job">
						<h3 class="role">Editorial Coder</h3>
						<div class="meta">The Hindu — Chennai</div>
						<div class="meta">May 2025 – present</div>
						<ul>
							<li>Turn data stories into interactives for a digital audience.</li>
							<li>Build and maintain datasets used in reporting projects.</li>
						</ul>
					</article>

					<article class="job">
						<h3 class="role">Data & Investigative Reporter</h3>
						<div class="meta">Knox News — Knoxville</div>
						<div class="meta">Sept 2022 – Feb 2025</div>
						<ul>
							<li>Watchdog public education beat; ~100k+ monthly page views.</li>
							<li>
								Created/managed databases (property sales, crime, budgets); led newsroom data
								trainings.
							</li>
						</ul>
					</article>

					<article class="job">
						<h3 class="role">Senior Sub-Editor</h3>
						<div class="meta">InMobi Glance — Bengaluru</div>
						<div class="meta">Dec 2019 – July 2021</div>
						<ul>
							<li>Co-led six editors curating lock-screen news feeds in India, Singapore & U.S.</li>
							<li>Worked with designers to optimize content for 100M+ users.</li>
						</ul>
					</article>

					<article class="job">
						<h3 class="role">News Publishing Specialist</h3>
						<div class="meta">Reuters — Bengaluru</div>
						<div class="meta">July 2018 – Dec 2019</div>
						<ul>
							<li>Redesigned bond/forex newsletters; streamlined creation workflow.</li>
							<li>Trained in company news reporting.</li>
						</ul>
					</article>

					<article class="job">
						<h3 class="role">Reporter</h3>
						<div class="meta">Idaho Press — Nampa</div>
						<div class="meta">June 2017 – April 2018</div>
					</article>

					<!-- Awards moved to LEFT under Idaho Press -->
					<section class="awards">
						<h2 class="res-h">Awards</h2>
						<ul>
							<li>
								<strong>East Tennessee Society of Professional Journalists</strong>
								<ul>
									<li>Golden Press Card — May 2025</li>
									<li>
										First place in general reporting; two seconds (government/politics reporting &
										series) — May 2024
									</li>
									<li>First place for continuing coverage on special ed — May 2025</li>
								</ul>
							</li>
							<li>
								<strong>Tennessee Press Association</strong>
								<ul>
									<li>
										Three first place awards: Best Education reporting in the state, single feature,
										and digital presentation — July 2024
									</li>
								</ul>
							</li>
							<li><strong>OpenNews Scholarships+</strong> — Funding to attend NICAR — Feb 2022</li>
							<li><strong>Shobhana Bhartia Fellowship</strong> — Aug 2020</li>
						</ul>
					</section>
				</div>

				<!-- RIGHT: Education, Skills, Selected projects, Talk, Languages -->
				<div class="col">
					<h2 class="res-h">Education</h2>
					<ul class="edu">
						<li>
							<strong>Columbia University, Graduate School of Journalism</strong><br />
							M.S. Data Journalism — Aug 2022 · Honours in Media Ethics
						</li>
						<li>
							<strong>Ohio Wesleyan University</strong><br />
							B.A. Journalism & Economics — May 2017
						</li>
					</ul>

					<h2 class="res-h">Skills / Tools</h2>
					<p class="skills-line">
						Reporting &amp; editing | Python (Pandas, BeautifulSoup, Selenium) | SQL | R | D3.js |
						Altair | Plotly | Adobe Illustrator | QGIS | Mapbox | Google Earth Pro | Datawrapper |
						Flourish | HTML | CSS | JavaScript
					</p>

					<h2 class="res-h">Selected projects</h2>
					<ul class="proj">
						{#each projects as p}
							<li>
								<a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a> — {p.dek}
							</li>
						{/each}
					</ul>

					<h2 class="res-h">Talk</h2>
					<ul class="talk">
						<li>
							<a
								href="https://www.ire.org/training/conferences/nicar-2022/"
								target="_blank"
								rel="noopener noreferrer">Lightning talk at NICAR</a
							> — NICAR 2022 (Atlanta)
						</li>
					</ul>

					<h2 class="res-h">Languages</h2>
					<p>Fluent in Hindi & Punjabi; beginner level in Odia.</p>

					<h2 class="res-h">Languages</h2>
					<p>Fluent in Hindi & Punjabi; beginner level in Odia.</p>

					<!-- Contact row -->
					<p class="resume-contact">
						<a href={links.emailHref} target="_blank" rel="noopener noreferrer"
							>{links.emailTextObfuscated}</a
						>
						|
						<a href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
						|
						<a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
						|
						<a href={links.twitter} target="_blank" rel="noopener noreferrer">X</a>
					</p>
					<p class="resume-download">
						<a
							class="btn"
							href={`${base}/Areena_Arora_Resume.pdf`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Download résumé (PDF)
						</a>
					</p>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	:root {
		--blue: #000dff;
		--ink: #222;
		--muted: #6b6b6b;
		--hairline: #e6e6e6;
		--section-gap: 10px;
	}

	/* Layout */
	.wrap {
		max-width: 1040px;
		margin: 0 auto;
		padding: clamp(20px, 4vw, 36px);
		color: var(--ink);
	}

	.titlebar {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: 14px;
		margin-bottom: 10px;
	}

	.page-title {
		margin: 0 0 8px 0;
		font-size: clamp(34px, 5vw, 56px);
		line-height: 1.1;
	}

	/* ---------- Minimal tabs (text w/ underline) ---------- */
	.tabs {
		display: flex;
		gap: 16px;
	}

	.tab {
		appearance: none;
		background: none;
		border: 0;
		padding: 10px 4px;
		font: inherit;
		font-size: 1.2rem; /* larger text */
		font-weight: 600; /* more weight */
		color: #333;
		cursor: pointer;
		position: relative;
		letter-spacing: 0.01em;
		transition: color 0.2s ease;
	}

	.tab::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -6px;
		height: 3px; /* thicker underline */
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.2s ease;
	}

	.tab:hover {
		color: var(--blue);
	}
	.tab:hover::after {
		transform: scaleX(1);
	}

	.tab.is-active {
		color: var(--blue);
		font-weight: 700; /* bolder when active */
	}
	.tab.is-active::after {
		transform: scaleX(1);
		background: var(--blue);
	}

	.tab:focus-visible {
		outline: none;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ---------- About view ---------- */
	.blue_links {
		color: var(--blue);
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: clamp(16px, 4vw, 28px);
	}
	.about-copy {
		font-size: 20px;
		font-weight: 500;
	}
	.about-copy p {
		margin: 0 0 18px;
	}

	.about-side {
		display: grid;
		gap: 10px;
		align-content: start;
	}
	.card {
		border: 1px solid var(--hairline);
		border-radius: 10px;
		padding: 16px 18px;
	}

	.card p {
		font-size: 18px;
		line-height: 0.8;
	}
	.card-title {
		margin: 0 0 8px;
		color: var(--blue);
		font-weight: 700;
		font-size: 18px;
	}
	.linklist {
		margin: 0;
		padding-left: 18px;
	}
	.linklist a {
		color: inherit;
		text-decoration: underline;
	}

	/* ---------- Résumé view ---------- */
	.resume {
		font-size: 18px;
		font-weight: 500;
	}
	.kicker {
		margin: 0 0 12px;
		color: var(--muted);
		font-size: 20px;
	}
	.res-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(18px, 3.5vw, 36px);
	}
	.col {
		display: block;
	}

	/* Blue section headers + uniform gap underneath */
	.res-h {
		color: var(--blue);
		line-height: 1.2;
		margin: 16px 0 0;
	}
	.col .res-h:first-child {
		margin-top: 0;
	}
	.res-h + * {
		margin-top: 10px !important;
		margin-bottom: 16px !important;
	}

	/* Experience */
	.job {
		margin-bottom: 10px;
	}
	.role {
		font-weight: 800;
		font-size: 1.2rem;
		line-height: 1.1;
		margin: 0 0 2px;
	}
	.meta {
		color: var(--muted);
		margin-bottom: 2px;
	}
	.job ul {
		margin: 8px 0 0 20px;
	}

	.edu {
		margin: 0;
		padding-left: 18px;
	}
	.skills-line {
		margin: 0;
	}
	.proj,
	.talk {
		margin: 0;
		padding-left: 18px;
	}
	.proj a,
	.talk a {
		color: inherit;
		text-decoration: underline;
	}

	.awards ul {
		margin: 0;
		padding-left: 18px;
	}
	.awards ul ul {
		margin-top: 6px;
	}

	/* Contact row */
	.resume-contact {
		margin-top: 4px;
	}
	.resume a {
		color: inherit;
		text-decoration: underline;
	}

	/* ---------- Minimal primary action ---------- */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5ch;
		padding: 8px 12px;
		border: 1px solid var(--hairline);
		border-radius: 999px;
		background: #fff;
		color: var(--ink);
		text-decoration: none;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}
	.btn:hover,
	.btn:focus-visible {
		background: rgba(0, 0, 0, 0.03);
		border-color: #d2d2d2;
		color: var(--ink);
		outline: none;
	}
	.resume-download {
		margin-top: 8px;
	}

	/* ---------- Global links ---------- */
	a {
		color: inherit;
		text-decoration: underline;
	}
	a:hover {
		text-underline-offset: 2px;
	}

	/* ---- copy-to-clipboard styles ---- */
	.email-line {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.copy-btn {
		appearance: none;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: 1px solid var(--hairline);
		border-radius: 8px;
		background: #fff;
		color: var(--blue);
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}
	.copy-btn:hover,
	.copy-btn:focus-visible {
		background: rgba(0, 0, 0, 0.03);
		border-color: #d2d2d2;
		outline: none;
	}
	.copy-btn .clip {
		flex: 0 0 auto;
	}
	.copy-btn.is-copied {
		color: #1a7f37;
		border-color: #bfe5c6;
		background: #ecf8ee;
	}

	/* ---------- Responsive ---------- */
	@media (max-width: 900px) {
		.about-grid,
		.res-grid {
			grid-template-columns: 1fr;
		}
		.titlebar {
			grid-template-columns: 1fr;
			align-items: start;
		}
		.tabs {
			justify-self: start;
		}
	}

	/* Motion guard */
	@media (prefers-reduced-motion: reduce) {
		.tab::after {
			transition: none;
		}
	}
</style>
