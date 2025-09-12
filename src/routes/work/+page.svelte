<script lang="ts">
	import { onMount } from "svelte";
	import { base } from "$app/paths";

	// ------------- Types -------------
	type Row = {
		headline: string;
		publication?: string;
		pub_date?: string;
		url?: string;
		project_type?: string;
		topics: string[];
		stacks: string[];
		pdf?: string;
		raw: Record<string, string>;
	};

	// ------------- State -------------
	let rows: Row[] = [];
	let loadError = "";

	// CSV headers (original labels) + normalized keys, IN CSV ORDER
	let colLabels: string[] = [];
	let colKeys: string[] = [];

	// Visible subset after hiding project_type/topics/tags/role/publication/tech stack
	let visibleLabels: string[] = [];
	let visibleKeys: string[] = [];

	// ------------- Helpers -------------
	const CSV_PATH = `${base}/data/data.csv`;
	const norm = (s: string) =>
		s
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_");

	const TYPE_KEYS = new Set(["project_type", "type", "kind", "category"]);
	const TOPIC_KEYS = new Set(["topics", "tags", "keywords"]);
	const STACK_KEYS = new Set(["tech_stack", "techstack", "tech", "stack", "tools", "technology"]);
	const EXCLUDE_COLS = new Set(["role", "tags", "publication"]);

	const shouldHide = (k: string) =>
		EXCLUDE_COLS.has(k) || TYPE_KEYS.has(k) || TOPIC_KEYS.has(k) || STACK_KEYS.has(k);

	const isDateKey = (k: string) =>
		["pub_date", "Date", "date", "published", "publish_date"].includes(k);
	const isUrlKey = (k: string) => ["url", "link", "href"].includes(k);
	const isPdfKey = (k: string) =>
		["pdf", "pdf_url", "pdf_download", "download_pdf", "download", "file"].includes(k);

	// wrap these columns
	const WRAP_KEYS = new Set([
		"headline",
		"title",
		"name",
		"summary",
		"deck",
		"description",
		"abstract",
		"subhead",
	]);
	const isWrapKey = (k: string) => WRAP_KEYS.has(k);

	const fmtDate = (d: string) => (d ? d.replace(/-/g, ".") : "");
	const shortUrl = (u: string) => {
		try {
			const { hostname } = new URL(u);
			return hostname.replace(/^www\./, "");
		} catch {
			return "Open";
		}
	};

	const pdfHref = (v: string) => {
		const val = v.trim();
		if (/^https?:\/\//i.test(val)) return val;
		return `${base}/downloads/${val}`;
	};

	// summary helpers (mobile under-headline)
	const SUMMARY_KEYS = ["summary", "deck", "description", "abstract", "subhead"];
	const isSummaryKey = (k: string) => SUMMARY_KEYS.includes(k);
	const isHeadlineKey = (k: string) => ["headline", "title", "name"].includes(k);
	const firstSummaryText = (raw: Record<string, string>) => {
		for (const k of SUMMARY_KEYS) {
			const v = (raw[k] || "").trim();
			if (v) return v;
		}
		return "";
	};

	// ------------- Parse CSV -------------
	function parseCSV(text: string) {
		const lines = text.trim().split(/\r?\n/);
		if (!lines.length) return;

		const headerCells =
			(lines.shift() as string)
				.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
				?.map(s => s.replace(/^"(.*)"$/, "$1")) ?? [];
		const headersNorm = headerCells.map(norm);

		colLabels = headerCells;
		colKeys = headersNorm;

		const getCell = (cells: string[], key: string) => {
			const i = headersNorm.indexOf(key);
			return i >= 0 ? (cells[i] ?? "").trim() : "";
		};
		const getAny = (cells: string[], keys: string[]) => {
			for (const k of keys) {
				const v = getCell(cells, k);
				if (v) return v;
			}
			return "";
		};

		const out: Row[] = [];

		for (const line of lines) {
			if (!line.trim()) continue;
			const cells =
				line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(s => s.replace(/^"(.*)"$/, "$1")) ?? [];

			const raw: Record<string, string> = {};
			headersNorm.forEach((k, i) => (raw[k] = (cells[i] ?? "").trim()));

			const project_type = getAny(cells, ["project_type", "type", "kind", "category"]);

			const topicsStr = getAny(cells, ["topics", "tags", "keywords"]);
			const topics = topicsStr
				? topicsStr
						.split(";")
						.map(t => t.trim())
						.filter(Boolean)
				: [];

			const stackRaw =
				getAny(cells, ["tech_stack", "techstack", "tech", "stack", "tools", "technology"]) || "";
			const stackClean = stackRaw.replace(/\bN\s*\/\s*A\b/gi, "").replace(/\bN\.?\s*A\.?\b/gi, "");
			let stacks = stackClean
				.split(/[;,/]+/)
				.map(s => s.trim())
				.filter(Boolean)
				.filter(s => {
					const p = s.replace(/[.\s]/g, "").toLowerCase();
					return p && p !== "na" && p !== "n" && p !== "a" && p !== "none" && p !== "-";
				});
			if (stacks.length === 1 && stacks[0].includes(",")) {
				stacks = stacks[0]
					.split(",")
					.map(s => s.trim())
					.filter(Boolean)
					.filter(s => {
						const p = s.replace(/[.\s]/g, "").toLowerCase();
						return p && p !== "na" && p !== "n" && p !== "a" && p !== "none" && p !== "-";
					});
			}

			out.push({
				headline: getAny(cells, ["headline", "title", "name"]),
				publication: getCell(cells, "publication"),
				pub_date: getAny(cells, [
					"pub_date",
					"publication_date",
					"date",
					"published",
					"publish_date",
				]),
				url: getAny(cells, ["url", "link", "href"]) || "",
				project_type,
				topics,
				stacks,
				pdf: getAny(cells, ["pdf", "pdf_url", "pdf_download", "download", "file"]) || "",
				raw,
			});
		}

		rows = out;

		// derive visible columns
		const vKeys: string[] = [];
		const vLabels: string[] = [];
		headersNorm.forEach((k, i) => {
			if (!shouldHide(k)) {
				vKeys.push(k);
				vLabels.push(headerCells[i]);
			}
		});
		visibleKeys = vKeys;
		visibleLabels = vLabels;
	}

	onMount(async () => {
		try {
			const res = await fetch(CSV_PATH);
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			parseCSV(await res.text());
		} catch (e) {
			loadError = String(e);
			console.error("CSV load failed:", e);
		}
	});

	// ------------- Filters & search -------------
	const TYPE_COLUMN_KEY = "project_type";

	$: ALL_TYPES = Array.from(
		new Set(rows.map(r => (r.raw[TYPE_COLUMN_KEY] || "").trim()).filter(Boolean)),
	).sort((a, b) => a.localeCompare(b));

	$: ALL_STACKS = Array.from(new Set(rows.flatMap(r => r.stacks))).sort((a, b) =>
		a.localeCompare(b),
	);

	$: typeCounts = Object.fromEntries(
		ALL_TYPES.map(t => [t, rows.filter(r => (r.raw[TYPE_COLUMN_KEY] || "").trim() === t).length]),
	) as Record<string, number>;

	$: stackCounts = Object.fromEntries(
		ALL_STACKS.map(s => [s, rows.filter(r => r.stacks.includes(s)).length]),
	) as Record<string, number>;

	let search = "";
	let typeSet = new Set<string>();
	let stackSet = new Set<string>();

	const toggleSet = <T,>(set: Set<T>, v: T) => {
		const next = new Set(set);
		if (next.has(v)) next.delete(v);
		else next.add(v);
		return next;
	};
	const clearFilters = () => {
		typeSet = new Set();
		stackSet = new Set();
		search = "";
	};

	$: filtered = rows
		.filter(r => (typeSet.size ? typeSet.has((r.raw[TYPE_COLUMN_KEY] || "").trim()) : true))
		.filter(r => (stackSet.size ? r.stacks.some(s => stackSet.has(s)) : true))
		.filter(r => {
			if (!search.trim()) return true;
			const hay = (
				r.headline +
				" " +
				(r.publication ?? "") +
				" " +
				r.stacks.join(" ") +
				" " +
				Object.values(r.raw).join(" ")
			).toLowerCase();
			return hay.includes(search.toLowerCase());
		});

	// ------------- Column sizing (desktop) -------------
	const trackForKey = (k: string) => {
		if (isDateKey(k)) return "minmax(90px, 0.6fr)";
		if (isUrlKey(k)) return "minmax(120px, 0.7fr)";
		if (isSummaryKey(k)) return "minmax(420px, 3fr)";
		if (isHeadlineKey(k)) return "minmax(280px, 2fr)";
		if (isPdfKey(k)) return "minmax(120px, 0.6fr)";
		return "minmax(150px, 1fr)";
	};

	$: gridCols = `${visibleKeys.map(trackForKey).join(" ")}`;
</script>

<section class="work">
	<div class="layout">
		<!-- LEFT: filters -->
		<aside class="filters">
			<div class="filters__bar">
				<div class="slash">/ FILTER</div>
				<button class="link" on:click={clearFilters}>CLEAR FILTERS</button>
			</div>

			<details open>
				<summary><span class="folder">▣</span> Type</summary>
				<ul class="checklist">
					{#each ALL_TYPES as t}
						<li>
							<label>
								<input
									type="checkbox"
									checked={typeSet.has(t)}
									on:change={() => (typeSet = toggleSet(typeSet, t))}
								/>
								<span class="lbl">{t}</span>
								<span class="count">{typeCounts[t] ?? 0}</span>
							</label>
						</li>
					{/each}
				</ul>
			</details>

			<details open>
				<summary><span class="folder">▣</span> Tech stack</summary>
				<ul class="checklist">
					{#each ALL_STACKS as s}
						<li>
							<label>
								<input
									type="checkbox"
									checked={stackSet.has(s)}
									on:change={() => (stackSet = toggleSet(stackSet, s))}
								/>
								<span class="lbl">{s}</span>
								<span class="count">{stackCounts[s] ?? 0}</span>
							</label>
						</li>
					{/each}
				</ul>
			</details>
		</aside>

		<!-- RIGHT: table -->
		<main class="results">
			<div class="table">
				<!-- header -->
				<div class="thead" style={`grid-template-columns:${gridCols};`}>
					{#each visibleLabels as lbl, i}
						<div class="cell head" data-key={visibleKeys[i]}>
							{#if isDateKey(visibleKeys[i])}
								<span class="desktop-only">{lbl}</span>
								<span class="mobile-only">URL / PDF</span>
							{:else}
								{lbl}
							{/if}
						</div>
					{/each}
				</div>

				<!-- body -->
				{#if loadError}
					<div class="empty">Couldn’t load data: {loadError}</div>
				{:else if filtered.length === 0}
					<div class="empty">No results.</div>
				{:else}
					{#each filtered as r}
						<div class="tr" style={`grid-template-columns:${gridCols};`}>
							{#each visibleKeys as k}
								<div class="cell" class:wrap={isWrapKey(k)} data-key={k}>
									{#if isUrlKey(k) && r.raw[k]}
										<a href={r.raw[k]} rel="noopener" target="_blank">{shortUrl(r.raw[k])}</a>
									{:else if isPdfKey(k)}
										{#if r.raw[k] && !/^(?:-|—|–|n\/?a|not needed)$/i.test(r.raw[k].trim())}
											<a
												class="pill"
												href={pdfHref(r.raw[k])}
												target="_blank"
												rel="noopener noreferrer"
											>
												Download
											</a>
										{:else}
											{r.raw[k]}
										{/if}
									{:else if isDateKey(k)}
										<!-- Desktop: date; Mobile: URL + PDF -->
										<span class="desktop-only">{fmtDate(r.raw[k])}</span>
										<span class="mobile-only mobile-links">
											{#if r.url}
												<a href={r.url} target="_blank" rel="noopener">{shortUrl(r.url)}</a>
											{/if}
											{#if r.pdf && !/^(?:-|—|–|n\/?a|not needed)$/i.test(r.pdf.trim())}
												<a
													class="pill"
													href={pdfHref(r.pdf)}
													target="_blank"
													rel="noopener noreferrer">Download PDF</a
												>
											{/if}
										</span>
									{:else if isHeadlineKey(k)}
										<div class="headline-block">
											<div>{r.raw[k]}</div>
											{#if firstSummaryText(r.raw)}
												<div class="summary-under mobile-only">{firstSummaryText(r.raw)}</div>
											{/if}
										</div>
									{:else}
										{r.raw[k]}
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</div>
		</main>
	</div>
</section>

<style>
	.work {
		padding: clamp(20px, 4vw, 28px) clamp(16px, 5vw, 56px);
	}

	/* Layout */
	.layout {
		display: grid;
		grid-template-columns: clamp(160px, 16vw, 180px) 1fr; /* 10px narrower */
		gap: clamp(16px, 3vw, 28px);
		align-items: start;
	}

	/* Sidebar */
	.filters {
		position: sticky;
		top: 64px;
		align-self: start;
	}
	.filters__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.slash {
		font-size: 12px;
		letter-spacing: 0.06em;
		opacity: 0.65;
	}
	.link {
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: 14px;
	}
	details {
		margin: 10px 0 18px;
	}
	summary {
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 0;
		border-bottom: 1px solid #eaeaea;
		font-weight: 600;
	}
	.folder {
		font-size: 12px;
		opacity: 0.6;
	}
	.checklist {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
	}
	.checklist li {
		padding: 6px 0;
	}
	.checklist label {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.checklist input {
		accent-color: #111;
	}
	.lbl {
		text-transform: none;
	}
	.count {
		margin-left: auto;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
	}

	/* Table */
	.table {
		width: 100%;
	}
	.thead,
	.tr {
		display: grid;
		gap: 12px;
		align-items: start;
	}
	.thead {
		padding: 6px 8px;
		border-bottom: 1px solid #eee;
	}
	.tr {
		padding: 12px 8px 14px;
		border-bottom: 1px solid #f0f0f0;
	}

	.cell.head {
		font-size: 12px;
		letter-spacing: 0.06em;
		opacity: 0.65;
		white-space: nowrap;
	}
	.cell {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.25;
	}
	:global(.cell.wrap) {
		white-space: normal !important;
		overflow: visible !important;
		text-overflow: unset !important;
		word-break: break-word;
		line-height: 1.4;
	}

	.tr {
		align-items: start;
	}
	.pill {
		display: inline-block;
		padding: 4px 8px;
		border: 1px solid #ddd;
		border-radius: 999px;
		text-decoration: none;
		color: inherit;
		font-size: 16px;
	}
	.pill:hover {
		border-color: #000;
	}
	.empty {
		padding: 24px 8px;
		opacity: 0.7;
	}

	.work {
		color: #000000;
		font-size: 21px;
		font-weight: 450;
		line-height: 1.5;
	}
	.cell.head {
		color: #000dff;
		font-size: 18px;
		opacity: 1;
		font-weight: bold;
	}

	.results {
		min-width: 0;
	}
	.table {
		width: 100%;
		overflow-x: auto;
	}
	.thead,
	.tr {
		min-width: 760px;
	} /* desktop keeps columns readable */

	/* Helpers for responsive swapping */
	.mobile-only {
		display: none;
	}
	.desktop-only {
		display: inline;
	}

	.headline-block {
		display: block;
	}
	.summary-under {
		margin-top: 4px;
		font-size: 0.9em;
		line-height: 1.35;
		opacity: 0.85;
	}

	/* MOBILE-ONLY OVERRIDES */
	@media (max-width: 920px) {
		/* Bold headlines only on mobile */
		.headline-block > div:first-child {
			font-weight: 700; /* bold headline */
		}

		/* Summaries remain normal */
		.headline-block .summary-under {
			font-weight: 400;
		}
		.layout {
			grid-template-columns: 1fr;
			gap: clamp(12px, 3vw, 20px);
		}
		.filters {
			display: none;
		}

		/* No horizontal scroll on mobile */
		.table {
			overflow-x: visible;
		}
		.thead,
		.tr {
			min-width: unset;
		}

		/* Only show two columns: headline + date(→ URL/PDF) */
		/* Hide any cell/header that is NOT headline/title/name and NOT date */
		.cell[data-key]:not([data-key="headline"]):not([data-key="title"]):not([data-key="name"]):not(
				[data-key="pub_date"]
			):not([data-key="date"]):not([data-key="published"]):not([data-key="publish_date"]) {
			display: none;
		}
		.cell.head[data-key]:not([data-key="headline"]):not([data-key="title"]):not(
				[data-key="name"]
			):not([data-key="pub_date"]):not([data-key="date"]):not([data-key="published"]):not(
				[data-key="publish_date"]
			) {
			display: none;
		}

		/* Two-column grid for rows/headers on mobile */
		.thead,
		.tr {
			grid-template-columns: minmax(0, 1fr) max-content !important;
			gap: 12px;
		}

		/* Headline a touch narrower (5px) */
		.headline-block {
			padding-right: 5px;
		}

		/* Mobile text sizes */
		.cell,
		.cell.head {
			font-size: 16px;
			line-height: 1.45;
		}
		:global(.cell.wrap) {
			word-break: break-word;
		}

		/* Swap Date → URL/PDF label */
		.mobile-only {
			display: inline;
		}
		.desktop-only {
			display: none;
		}

		/* URL + PDF inline style */
		.mobile-links {
			display: flex;
			align-items: center;
			gap: 10px;
			flex-wrap: wrap;
		}
		.mobile-links .pill {
			font-size: 13px;
			padding: 3px 8px;
		}
	}
</style>
