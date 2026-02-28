<script lang="ts">
	import snapshot from '$lib/data/tidbits_snapshot.json';

	type Bucket = { label: string; count: number };
	type Signal = {
		id: number;
		created_at: string;
		text: string;
		url?: string | null;
		geography: string;
		category: string;
		sector: string;
		theme: string;
	};

	const data = snapshot as {
		lastUpdated: string;
		totalSignals: number;
		topGeographies: Bucket[];
		topCategories: Bucket[];
		topSectors: Bucket[];
		topThemes: Bucket[];
		signals: Signal[];
	};

	const strongestSectors = data.topSectors.slice(0, 3);
	const strongestThemes = data.topThemes.slice(0, 3);
	const strongestGeographies = data.topGeographies.slice(0, 3);

	let expandedRowId: string | null = null;
	function toggleExpandRow(id: number) {
		const key = String(id);
		expandedRowId = expandedRowId === key ? null : key;
	}

	function fmtDate(value: string): string {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value;
		return d.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function fmtUpdated(value: string): string {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return value;
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function themeForSector(label: string): string {
		const first = data.signals.find((s) => s.sector === label)?.theme;
		return first ? `Driven by ${first}.` : 'No dominant theme yet.';
	}

	function geoForTheme(label: string): string {
		const first = data.signals.find((s) => s.theme === label)?.geography;
		return first ? `Centered on ${first}.` : 'No clear geography signal yet.';
	}

	function themeForGeo(label: string): string {
		const first = data.signals.find((s) => s.geography === label)?.theme;
		return first ? `Focused on ${first}.` : 'No clear theme signal yet.';
	}
</script>

<svelte:head>
	<title>Tidbits Tracker</title>
</svelte:head>

<main class="page">
	<section class="hero-grid">
		<a class="home-tile" href="/">
			<span class="home-title">HOME</span>
		</a>
		<div class="hero-main">
			<h1>TIDBITS TRACKER</h1>
			<p class="stamp">Last updated: {fmtUpdated(data.lastUpdated)}</p>
		</div>
	</section>

	<section class="heat-grid">
		<div class="heat-col">
			<div class="heat-head">
				<span class="heat-kicker sector">• SECTOR VELOCITY</span>
				<h3>Top Sectors</h3>
				<p class="radar-summary">Static snapshot of strongest sector labels from latest ingested signals.</p>
				<p class="heat-foot">LAST UPDATE</p>
			</div>
			<ol>
				{#each strongestSectors as item, idx}
					<li>
						<div class="heat-item">
							<span class="rank">{String(idx + 1).padStart(2, '0')}</span>
							<span class="radar-label">{item.label}</span>
							<span class="radar-note">{themeForSector(item.label)}</span>
							<span class="trend-pill">{item.count} signals</span>
						</div>
					</li>
				{/each}
			</ol>
		</div>
		<div class="heat-col">
			<div class="heat-head">
				<span class="heat-kicker theme">• THEMATIC SHIFT</span>
				<h3>Top Themes</h3>
				<p class="radar-summary">Most frequent themes in the current static dataset.</p>
				<p class="heat-foot">LAST UPDATE</p>
			</div>
			<ol>
				{#each strongestThemes as item, idx}
					<li>
						<div class="heat-item">
							<span class="rank">{String(idx + 1).padStart(2, '0')}</span>
							<span class="radar-label">{item.label}</span>
							<span class="radar-note">{geoForTheme(item.label)}</span>
							<span class="trend-pill">{item.count} signals</span>
						</div>
					</li>
				{/each}
			</ol>
		</div>
		<div class="heat-col">
			<div class="heat-head">
				<span class="heat-kicker geo">• GEO HEATMAP</span>
				<h3>Top Geographies</h3>
				<p class="radar-summary">Most active geographies based on latest labeled signals.</p>
				<p class="heat-foot">LAST UPDATE</p>
			</div>
			<ol>
				{#each strongestGeographies as item, idx}
					<li>
						<div class="heat-item">
							<span class="rank">{String(idx + 1).padStart(2, '0')}</span>
							<span class="radar-label">{item.label}</span>
							<span class="radar-note">{themeForGeo(item.label)}</span>
							<span class="trend-pill">{item.count} signals</span>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<section class="panel">
		<h2 id="signals-table">Signals Table</h2>
		<p class="muted">Read-only website snapshot. Overrides/training are disabled here.</p>
		<div class="table-wrap card table-card">
			<table>
				<colgroup>
					<col style="width: 5%;" />
					<col style="width: 16%;" />
					<col style="width: 27%;" />
					<col style="width: 4%;" />
					<col style="width: 12%;" />
					<col style="width: 12%;" />
					<col style="width: 12%;" />
					<col style="width: 12%;" />
				</colgroup>
				<thead>
					<tr>
						<th class="sticky-col">Sr. no</th>
						<th class="sticky-col-2">Date</th>
						<th>Text</th>
						<th class="url-col">Url</th>
						<th>Geography</th>
						<th>Category</th>
						<th>Sector</th>
						<th>Theme</th>
					</tr>
				</thead>
				<tbody>
					{#each data.signals.slice(0, 60) as item, idx (item.id)}
						<tr>
							<td class="mono sticky-col">{idx + 1}</td>
							<td class="sticky-col-2 date-col">{fmtDate(item.created_at)}</td>
							<td class="textTd">
								{#if expandedRowId === String(item.id)}
									<div class="textCellExpanded" title={item.text}>
										{item.text}
									</div>
								{:else}
									<div class="textCell" title={item.text}>
										{item.text}
									</div>
								{/if}
								<button class="expandBtn" on:click={() => toggleExpandRow(item.id)}>
									{expandedRowId === String(item.id) ? 'Collapse' : 'Expand'}
								</button>
							</td>
							<td class="url-col">
								{#if item.url}
									<a href={item.url} target="_blank" rel="noreferrer" title={item.url}>↗</a>
								{:else}-{/if}
							</td>
							<td>{item.geography}</td>
							<td>{item.category}</td>
							<td>{item.sector}</td>
							<td>{item.theme}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>

<style>
	.page,
	.page * {
		font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
	}

	:global(:root) {
		--bg: #eef4ec;
		--card: #f7f7f4;
		--border: #cfd6cc;
		--text: #111111;
		--muted: #4b5563;
		--accent: #a480cf;
		--accent-soft: #ece2f8;
		--highlight: #ffc857;
		--success: #2f855a;
	}

	:global(body) {
		font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		background-color: #f2f2f0;
		background-image: linear-gradient(#d6d6d6 1px, transparent 1px), linear-gradient(90deg, #d6d6d6 1px, transparent 1px);
		background-size: 44px 44px;
		color: var(--text);
		margin: 0;
	}

	.page {
		max-width: 1180px;
		margin: 0 auto;
		padding: 20px 20px 28px;
		display: grid;
		gap: 24px;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: 220px 1fr;
		border: 2px solid #111;
		background: #f2f2f0;
	}

	.home-tile {
		display: grid;
		align-content: space-between;
		padding: 26px 20px;
		text-decoration: none;
		color: #111;
		border-right: 2px solid #111;
		background-image: linear-gradient(#dcdcdc 1px, transparent 1px), linear-gradient(90deg, #dcdcdc 1px, transparent 1px);
		background-size: 22px 22px;
	}

	.home-title {
		font-weight: 800;
		font-size: 34px;
		line-height: 1;
	}

	.hero-main {
		position: relative;
		padding: 22px 32px;
	}

	.hero-kicker {
		font-size: 13px;
		letter-spacing: 0.08em;
	}

	h1 {
		font-size: 88px;
		line-height: 0.95;
		font-weight: 900;
		letter-spacing: -0.03em;
		margin: 8px 0 0;
	}

	.hero-side {
		position: absolute;
		right: 26px;
		top: 30px;
		text-align: right;
		font-size: 46px;
		line-height: 0.95;
		font-weight: 700;
	}

	h2 {
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 12px;
	}

	h3 {
		font-size: 19px;
		font-weight: 600;
		margin: 0 0 10px;
		color: var(--text);
	}

	.panel {
		display: grid;
		gap: 12px;
	}

	.training-panel {
		padding-top: 4px;
		border-top: 1px solid var(--border);
	}

	.heat-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-left: 2px solid #111;
		border-right: 2px solid #111;
		border-bottom: 2px solid #111;
	}

	.heat-col {
		border-right: 2px solid #111;
		background: #f2f2f0;
	}

	.heat-col:last-child {
		border-right: 0;
	}

	.heat-head {
		padding: 20px 20px 10px;
		border-bottom: 2px solid #111;
		min-height: 120px;
	}

	.card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 8px 28px rgba(17, 17, 17, 0.06);
	}

	ol {
		margin: 0;
		padding-left: 0;
		list-style: none;
	}

	.heat-col ol {
		display: grid;
		grid-template-rows: repeat(3, minmax(118px, auto));
	}

	.heat-kicker {
		font-size: 12px;
		letter-spacing: 0.08em;
		font-weight: 700;
	}

	.heat-kicker.sector { color: #ef4444; }
	.heat-kicker.theme { color: #2563eb; }
	.heat-kicker.geo { color: #0ea5a4; }

	.heat-foot {
		margin: 8px 0 0;
		font-size: 12px;
		letter-spacing: 0.08em;
		color: #666;
	}

	.rank {
		grid-column: 1;
		grid-row: 1 / span 3;
		align-self: stretch;
		padding: 2px 12px 0 4px;
		border-right: 1px solid #111;
		font-weight: 800;
		font-size: 36px;
		line-height: 1;
		color: #111;
	}

	.radar-label {
		grid-column: 2;
		display: block;
		font-weight: 800;
		color: #5b21b6;
		font-size: 18px;
		line-height: 1.2;
		margin-top: 2px;
	}

.radar-meta {
	display: block;
	font-size: 12px;
	color: var(--muted);
	margin-top: 2px;
}

.radar-note {
	grid-column: 2;
	display: block;
	font-size: 12px;
	color: var(--muted);
	margin-top: 0;
}

.radar-summary {
	margin: 10px 0;
	font-size: 14px;
	line-height: 1.45;
	color: #444;
	white-space: pre-line;
}

	.heat-col ol li {
		height: 100%;
		padding: 0 16px;
		border-bottom: 1px solid #bdbdbd;
	}

	.heat-col ol li:last-child {
		border-bottom: 0;
	}

	.heat-item {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr);
		align-items: start;
		column-gap: 14px;
		row-gap: 6px;
		width: 100%;
		padding: 16px 0;
	}

	.heat-item-placeholder {
		min-height: 118px;
	}

	.trend-pill {
		grid-column: 2;
		justify-self: start;
		display: inline-block;
		margin-top: 4px;
		padding: 3px 8px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		border-radius: 4px;
		border: 1px solid #c9c9c9;
		color: #444;
		background: #ececec;
	}

	.trend-new {
		color: var(--accent);
		border-color: #bfdbfe;
		background: var(--accent-soft);
	}

	.trend-up {
		color: var(--success);
		border-color: #bbf7d0;
		background: #f0fdf4;
	}

	.trend-flat {
		color: var(--muted);
		border-color: var(--border);
		background: #f8fafc;
	}

	.trend-down {
		color: #b45309;
		border-color: #fed7aa;
		background: #fff7ed;
	}

	.delta-pos {
		color: var(--success);
		font-weight: 600;
	}

	.muted {
		margin: 0;
		font-size: 13px;
		color: var(--muted);
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		background: #f1f2ef;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 12px 14px;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.control-group {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		border: 2px solid #111111;
		border-radius: 12px;
		padding: 6px 10px;
		background: #ffffff;
	}

	.inline-label {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
	}

	.search-label {
		gap: 10px;
		min-width: 420px;
	}

	.search-input {
		flex: 1;
		width: 100%;
		padding: 8px 2px;
		font-size: 14px;
		border: 0;
		outline: 0;
		background: transparent;
	}

	.clear-search {
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 6px;
		padding: 1px 5px;
		font-size: 11px;
		cursor: pointer;
		color: var(--muted);
	}

	.compact-btn {
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 600;
		border: 1.5px solid #111111;
		border-radius: 10px;
		background: #ffffff;
		cursor: pointer;
	}

	.compact-btn.secondary {
		color: #111111;
	}

	.compact-btn.primary {
		background: #111111;
		border-color: #111111;
		color: #ffffff;
	}

	.compact-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip {
		padding: 4px 9px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 12px;
		cursor: pointer;
	}

	.chip-active {
		background: var(--accent-soft);
		border-color: #b7cffb;
		color: var(--accent);
		font-weight: 600;
	}

	.toggle-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 9px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 12px;
	}

	.switch {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		user-select: none;
	}

	.switch input {
		position: absolute;
		opacity: 1;
		width: 0;
		height: 0;
	}

	.slider {
		position: relative;
		width: 42px;
		height: 24px;
		border-radius: 999px;
		background: #d4d4d4;
		border: 1px solid #111111;
		transition: background 0.2s ease;
	}

	.slider::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		transition: transform 0.2s ease;
	}

	.switch input:checked + .slider {
		background: var(--highlight);
	}

	.switch input:checked + .slider::after {
		transform: translateX(16px);
	}

	.switch-label {
		font-size: 12px;
		color: #000;
	}

	.table-wrap {
		overflow: visible;
		max-height: none;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: 14px;
		padding: 0;
		box-shadow: 0 10px 28px rgba(17, 17, 17, 0.08);
	}

	.table-card {
		padding: 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 13px;
		line-height: 1.4;
	}

	th,
	td {
		padding: 12px 10px;
		border-bottom: 1px solid #d8d8d8;
		vertical-align: top;
		text-align: left;
		background: var(--card);
		overflow-wrap: anywhere;
	}

	thead th {
		position: static;
		background: #f7f7f4;
		color: #111111;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.01em;
		border-bottom: 2px solid #111111;
	}

	.sticky-col,
	.sticky-col-2 {
		position: static;
		left: auto;
		z-index: auto;
	}

	tbody tr:nth-child(even) td {
		background: #efefef;
	}

	tbody tr:hover td {
		background: #e7e3f1;
	}

	.textTd {
		position: relative;
		font-size: 15px;
		line-height: 1.5;
		color: #111111;
	}

	.textCell {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		word-break: break-word;
		overflow-wrap: anywhere;
	}

	.textCellExpanded {
		display: block;
		-webkit-line-clamp: initial;
		line-clamp: initial;
		-webkit-box-orient: initial;
		white-space: normal;
		overflow: visible;
		text-overflow: clip;
		overflow-wrap: anywhere;
		word-break: break-word;
		background: #fff5de;
		border-left: 4px solid var(--highlight);
		border-radius: 8px;
		padding: 8px 10px;
	}

	.expandBtn {
		display: inline-block;
		border: 0;
		padding: 0;
		margin-top: 6px;
		background: none;
		font-size: 11px;
		color: var(--muted);
		cursor: pointer;
		text-decoration: underline;
		opacity: 1;
		transition: opacity 0.12s ease;
	}


	.url-col {
		text-align: center;
		min-width: 44px;
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-variant-numeric: tabular-nums;
	}

	.date-col {
		font-family: inherit;
		font-size: 13px;
		font-weight: 500;
		color: #111111;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.linkish {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		cursor: pointer;
		text-align: left;
		font: inherit;
	}

	.heat-item .radar-note {
		color: #3f3f46;
		font-size: 14px;
		margin-top: 0;
	}

	select {
		width: 100%;
		min-width: 0;
		border-radius: 10px;
		border: 1px solid #bfbfbf;
		padding: 6px 8px;
		background: #ffffff;
		color: #111111;
		font-size: 12px;
	}

	select:focus {
		outline: 2px solid var(--accent-soft);
		outline-offset: 1px;
	}

	a {
		color: var(--accent);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		display: grid;
		place-items: center;
		z-index: 1000;
	}

	.passkey-modal {
		width: min(420px, 92vw);
		background: #fff;
		border: 2px solid #111;
		border-radius: 12px;
		padding: 18px;
		display: grid;
		gap: 10px;
	}

	.passkey-modal h3 {
		margin: 0;
		font-size: 20px;
	}

	.passkey-modal input {
		border: 1.5px solid #111;
		border-radius: 10px;
		padding: 10px 12px;
		font-size: 14px;
	}

	.passkey-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	.passkey-error {
		margin: 0;
		font-size: 12px;
		color: #b91c1c;
	}

	@media (max-width: 1100px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}
		.home-tile {
			border-right: 0;
			border-bottom: 2px solid #111;
		}
		h1 {
			font-size: 72px;
		}
		.hero-side {
			position: static;
			display: block;
			margin-top: 12px;
			font-size: 28px;
			text-align: left;
		}
		.heat-grid {
			grid-template-columns: 1fr;
		}
		.heat-col {
			border-right: 0;
			border-bottom: 2px solid #111;
		}
		.heat-col:last-child {
			border-bottom: 0;
		}
	}
</style>
