<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { getAllPosts } from "$lib/posts";

	// Minimal shape we need for rendering
	type PostListItem = { slug: string; title: string; date: string };

	// wallpaper toggle
	onMount(() => document.body.classList.add("win96-wallpaper"));
	onDestroy(() => document.body.classList.remove("win96-wallpaper"));

	// blog posts
	let allPosts: PostListItem[] = [];
	onMount(async () => {
		try {
			allPosts = await getAllPosts();
		} catch (e) {
			console.error("Failed to load posts", e);
			allPosts = [];
		}
	});

	/* ---------------- Layout constants ---------------- */
	const SAFE_LEFT = 120;
	const TASKBAR_H = 44;
	const EDGE_PAD = 12;

	/* ---------------- Window model ---------------- */
	type Win = {
		id: "projects" | "blog" | "terminal";
		title: string;
		minimized: boolean;
		maximized: boolean;
		z: number;
		x: number;
		y: number;
		w: number;
		h: number;
		prevBounds?: { x: number; y: number; w: number; h: number };
	};
	type Wins = Partial<Record<Win["id"], Win>>;

	let zCounter = 10;

	function makeWinDefaults(id: Win["id"]): Win {
		if (id === "projects") {
			return {
				id: "projects",
				title: "Projects",
				minimized: false,
				maximized: false,
				z: ++zCounter,
				x: SAFE_LEFT + 20,
				y: 96,
				w: 520,
				h: 360,
			};
		}
		if (id === "blog") {
			return {
				id: "blog",
				title: "Blog",
				minimized: false,
				maximized: false,
				z: ++zCounter,
				x: 600,
				y: 160,
				w: 560,
				h: 420,
			};
		}
		return {
			id: "terminal",
			title: "Terminal",
			minimized: false,
			maximized: false,
			z: ++zCounter,
			x: 300,
			y: 200,
			w: 600,
			h: 400,
		};
	}

	let wins: Wins = {}; // none open by default
	function bumpWins() {
		wins = { ...wins };
	}

	/* ---------------- Z-order helpers ---------------- */
	function topId(): Win["id"] | null {
		const arr = Object.values(wins as Record<string, Win>);
		if (arr.length === 0) return null;
		return arr.reduce((a, b) => (a.z > b.z ? a : b)).id;
	}
	function bringToFront(id: Win["id"]) {
		const w = wins[id];
		if (!w) return;
		w.z = ++zCounter;
		wins = { ...wins };
	}

	/* ---------------- Window actions ---------------- */
	function toggleMin(id: Win["id"]) {
		const w = wins[id];
		if (!w) return;
		w.minimized = !w.minimized;
		if (w.minimized) w.maximized = false;
		wins = { ...wins };
	}
	function toggleMax(id: Win["id"]) {
		const w = wins[id];
		if (!w) return;
		if (!w.maximized) {
			w.prevBounds = { x: w.x, y: w.y, w: w.w, h: w.h };
			w.maximized = true;
			w.minimized = false;
		} else {
			w.maximized = false;
			if (w.prevBounds) {
				const b = w.prevBounds;
				w.x = b.x;
				w.y = b.y;
				w.w = b.w;
				w.h = b.h;
			}
		}
		bringToFront(id);
		wins = { ...wins };
	}
	function winStyle(w: Win) {
		if (w.minimized) return `display:none; position:absolute; z-index:${w.z};`;
		if (w.maximized) {
			return `
        position: fixed; left: 0; top: 0; right: 0; bottom: var(--taskbar-h);
        width: auto; height: auto; transform: none; z-index: 9998;
      `;
		}
		return `
      position: absolute; width: ${w.w}px; height: ${w.h}px;
      transform: translate3d(${w.x}px, ${w.y}px, 0); z-index: ${w.z};
    `;
	}
	function closeWindow(id: Win["id"]) {
		if (wins[id]) {
			delete wins[id];
			wins = { ...wins };
		}
	}

	// Handle the "Address" bar like a simple command box
	function onAddressSubmit(currentId: Win["id"], ev: Event) {
		const form = ev.currentTarget as HTMLFormElement;
		const input = form.querySelector(".address") as HTMLInputElement | null;
		const raw = (input?.value || "").trim().toLowerCase();

		if (raw === "projects" || raw === "blog" || raw === "terminal") {
			openFromIcon(raw as Win["id"]);
			bringToFront(raw as Win["id"]);
			return;
		}
		if (raw === "areena" || raw === "home" || raw === "/") {
			window.location.href = "/";
			return;
		}
		if (raw === "close" || raw === "x") {
			closeWindow(currentId);
			return;
		}
		if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
			window.location.href = raw;
		}
	}

	/* ---------------- MOBILE single-window mode ---------------- */
	let isMobile = false;
	function updateIsMobile() {
		isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches;
	}
	function closeAllWindows() {
		for (const k of Object.keys(wins) as Win["id"][]) delete wins[k];
	}
	function placeNicelyMobile(w: Win) {
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		const pad = TASKBAR_H + 16;

		const targetW = Math.round(Math.min(vw * 0.96, 520));
		const targetH = Math.round(Math.min(vh * 0.6, 560));

		w.w = targetW;
		w.h = targetH;
		w.x = Math.max(6, Math.round((vw - targetW) / 2));
		w.y = Math.max(6, Math.round((vh - pad - targetH) / 2));
	}

	function openFromIcon(id: Win["id"]) {
		// On mobile: allow only one window at a time (replace any open one)
		if (isMobile) {
			closeAllWindows();
			wins[id] = makeWinDefaults(id);
			placeNicelyMobile(wins[id]!);
			wins[id]!.z = ++zCounter;
			wins = { ...wins };
			return;
		}

		// Desktop behavior unchanged
		if (!wins[id]) wins[id] = makeWinDefaults(id);
		else wins[id]!.minimized = false;
		if (wins[id]) wins[id]!.z = ++zCounter;
		wins = { ...wins };
	}
	function openTerminal() {
		openFromIcon("terminal");
	}

	/* ---------------- Window dragging ---------------- */
	let desktopEl: HTMLDivElement;
	const winEl: Record<Win["id"], HTMLElement> = {} as Record<Win["id"], HTMLElement>;
	function storeRef(node: HTMLElement, params: { id: Win["id"] }) {
		winEl[params.id] = node;
		return {
			update(next: { id: Win["id"] }) {
				if (next.id !== params.id) {
					delete winEl[params.id];
					winEl[next.id] = node;
					params = next;
				}
			},
			destroy() {
				delete winEl[params.id];
			},
		};
	}
	type Drag = {
		id: Win["id"];
		startX: number;
		startY: number;
		startWinX: number;
		startWinY: number;
		curX: number;
		curY: number;
		maxX: number;
		maxY: number;
		moved: boolean;
		pointerId: number;
	} | null;

	let drag: Drag = null;
	const THRESHOLD = 3;
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

	function onTitlebarPointerDown(id: Win["id"], ev: PointerEvent) {
		if (ev.button !== 0) return;
		const target = ev.target as HTMLElement;
		if (target.closest(".buttons")) return;

		const w = wins[id];
		if (!w || w.maximized || w.minimized) return;

		bringToFront(id);

		const maxX = Math.max(SAFE_LEFT, desktopEl.clientWidth - w.w);
		const maxY = Math.max(0, desktopEl.clientHeight - TASKBAR_H - w.h);

		drag = {
			id,
			startX: ev.clientX,
			startY: ev.clientY,
			startWinX: w.x,
			startWinY: w.y,
			curX: w.x,
			curY: w.y,
			maxX,
			maxY,
			moved: false,
			pointerId: ev.pointerId,
		};

		(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
		document.body.style.userSelect = "none";
		document.body.classList.add("dragging");
		ev.preventDefault();
	}
	function onPointerMove(ev: PointerEvent) {
		if (!drag) return;
		const dx = ev.clientX - drag.startX;
		const dy = ev.clientY - drag.startY;
		if (!drag.moved && Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
		drag.moved = true;

		const nx = clamp(drag.startWinX + dx, SAFE_LEFT, drag.maxX);
		const ny = clamp(drag.startWinY + dy, 0, drag.maxY);
		drag.curX = nx;
		drag.curY = ny;

		const el = winEl[drag.id];
		if (el) el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
	}
	function onPointerUp() {
		if (!drag) return;
		const w = wins[drag.id];
		if (w) {
			w.x = drag.curX;
			w.y = drag.curY;
			wins = { ...wins };
		}
		drag = null;
		document.body.style.userSelect = "";
		document.body.classList.remove("dragging");
	}

	/* ---------------- Taskbar / Start ---------------- */
	let startOpen = false;
	function toggleStart() {
		startOpen = !startOpen;
	}
	function closeStart() {
		startOpen = false;
	}
	function startOpenProjects() {
		openFromIcon("projects");
		startOpen = false;
	}
	function startOpenBlog() {
		openFromIcon("blog");
		startOpen = false;
	}
	function startOpenTerminal() {
		openTerminal();
		startOpen = false;
	}

	function onDesktopClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest(".taskbar") && !target.closest(".start-menu")) startOpen = false;
	}

	/* ---------------- Task buttons ---------------- */
	function onTaskClick(id: Win["id"]) {
		const w = wins[id];
		if (!w) {
			if (id === "terminal") openTerminal();
			return;
		}
		if (w.minimized) {
			w.minimized = false;
			bringToFront(id);
		} else if (topId() === id) {
			w.minimized = true;
		} else {
			bringToFront(id);
		}
		wins = { ...wins };
	}

	/* ---------------- Clock ---------------- */
	let time = "";
	let clockTimer: ReturnType<typeof setInterval> | undefined;
	function updateClock() {
		const d = new Date();
		time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
	}

	/* =================== DRAGGABLE DESKTOP ICONS (free drop; NO persistence) =================== */
	type IconId = "projects" | "blog" | "terminal" | "areena";
	type Icon = { id: IconId; label: string; img: string; x: number; y: number };

	const ICON_W = 82;
	const ICON_H = 82;
	const LABEL_H = 26;

	// Initial positions (single left column), in raw pixels
	function defaultIcons(): Icon[] {
		return [
			{ id: "projects", label: "Projects", img: "/briefcase.png", x: 0, y: 0 },
			{ id: "blog", label: "Blog", img: "/notepad.png", x: 0, y: 132 }, // 82 + 26 + ~24 gap
			{ id: "terminal", label: "Terminal", img: "/console.png", x: 0, y: 264 },
			{ id: "areena", label: "Areena", img: "/computer.png", x: 0, y: 396 },
		];
	}

	// No localStorage: always reset to defaults on refresh
	let icons: Icon[] = defaultIcons();

	const iconEl: Record<IconId, HTMLElement> = {} as Record<IconId, HTMLElement>;
	function iconRef(node: HTMLElement, id: IconId) {
		iconEl[id] = node;
		return {
			destroy() {
				delete iconEl[id];
			},
		};
	}

	type IconDrag = {
		id: IconId;
		startX: number;
		startY: number;
		startIconX: number;
		startIconY: number;
		curX: number;
		curY: number;
		maxX: number;
		maxY: number;
		moved: boolean;
		pointerId: number;
	} | null;
	let iconDrag: IconDrag = null;

	function activateIcon(id: IconId) {
		if (id === "areena") window.location.href = "/";
		else if (id === "terminal") openTerminal();
		else openFromIcon(id);
	}

	function iconPointerDown(ic: Icon, ev: PointerEvent) {
		if (ev.button !== 0) return;
		const maxX = Math.max(0, desktopEl.clientWidth - ICON_W - 4);
		const maxY = Math.max(0, desktopEl.clientHeight - TASKBAR_H - (ICON_H + LABEL_H) - 4);
		iconDrag = {
			id: ic.id,
			startX: ev.clientX,
			startY: ev.clientY,
			startIconX: ic.x,
			startIconY: ic.y,
			curX: ic.x,
			curY: ic.y,
			maxX,
			maxY,
			moved: false,
			pointerId: ev.pointerId,
		};
		(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
		document.body.style.userSelect = "none";
		ev.preventDefault();
	}

	function iconPointerMove(ev: PointerEvent) {
		if (!iconDrag) return;
		const dx = ev.clientX - iconDrag.startX;
		const dy = ev.clientY - iconDrag.startY;
		if (!iconDrag.moved && Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
		iconDrag.moved = true;

		// clamp within desktop bounds
		const nx = clamp(iconDrag.startIconX + dx, 0, iconDrag.maxX);
		const ny = clamp(iconDrag.startIconY + dy, 0, iconDrag.maxY);
		iconDrag.curX = nx;
		iconDrag.curY = ny;

		const el = iconEl[iconDrag.id];
		if (el) el.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
	}

	function iconPointerUp() {
		if (!iconDrag) return;

		// final position = exactly where the cursor ended (clamped)
		const x = clamp(iconDrag.curX, 0, iconDrag.maxX);
		const y = clamp(iconDrag.curY, 0, iconDrag.maxY);

		// commit to state
		const idx = icons.findIndex(i => i.id === iconDrag!.id);
		if (idx !== -1) {
			icons[idx] = { ...icons[idx], x, y };
			icons = [...icons];
		}

		// ensure the element ends exactly there
		const el = iconEl[iconDrag.id];
		if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

		// treat as a click only if there was no drag
		if (!iconDrag.moved) activateIcon(iconDrag.id);

		iconDrag = null;
		document.body.style.userSelect = "";
	}

	/* ---------------- Terminal state & commands ---------------- */
	let termInput = "";
	let termHistory: string[] = [];
	function escapeHtml(s: string) {
		return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
	}
	function runCommand() {
		const cmd = termInput.trim();
		termHistory = [...termHistory, `$ ${escapeHtml(cmd)}`];
		if (cmd === "ls") termHistory = [...termHistory, "projects  blog"];
		else if (/^print\s*\(.+\)$/.test(cmd)) {
			const m = cmd.match(/^print\s*\((.*)\)$/);
			termHistory = [...termHistory, escapeHtml(m ? m[1] : "")];
		} else if (cmd === "cd blog") {
			openFromIcon("blog");
			bringToFront("blog");
			termHistory = [...termHistory, "Opened blog window"];
		} else if (cmd === "cd project" || cmd === "cd projects") {
			openFromIcon("projects");
			bringToFront("projects");
			termHistory = [...termHistory, "Opened projects window"];
		} else if (cmd.length === 0) {
			// noop
		} else {
			termHistory = [...termHistory, `Command not found: ${escapeHtml(cmd)}`];
		}
		termInput = "";
		requestAnimationFrame(() => {
			const container = document.querySelector(".terminal") as HTMLElement | null;
			if (container) container.scrollTop = container.scrollHeight;
		});
	}

	/* ---------------- Mount/Unmount listeners ---------------- */
	onMount(() => {
		updateIsMobile();
		window.addEventListener("resize", updateIsMobile);

		updateClock();
		clockTimer = setInterval(updateClock, 15_000);

		// window dragging
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);

		// icon dragging
		window.addEventListener("pointermove", iconPointerMove);
		window.addEventListener("pointerup", iconPointerUp);

		// start menu closer
		window.addEventListener("click", onDesktopClick);
	});

	onDestroy(() => {
		if (clockTimer) clearInterval(clockTimer);

		window.removeEventListener("resize", updateIsMobile);

		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);

		window.removeEventListener("pointermove", iconPointerMove);
		window.removeEventListener("pointerup", iconPointerUp);

		window.removeEventListener("click", onDesktopClick);
	});
</script>

<!-- Desktop -->
<div
	class="desktop"
	bind:this={desktopEl}
	style={`--taskbar-h:${TASKBAR_H}px; --edge-pad:${EDGE_PAD}px`}
	role="application"
>
	<!-- Draggable desktop icons (free drop; reset on refresh) -->
	<div class="icons-layer">
		{#each icons as ic (ic.id)}
			<button
				class="icon"
				use:iconRef={ic.id}
				style={`transform: translate3d(${ic.x}px, ${ic.y}px, 0)`}
				on:pointerdown={(e: PointerEvent) => iconPointerDown(ic, e)}
				aria-label={`Open ${ic.label}`}
			>
				<img class="icon-img" width="32" height="32" src={ic.img} alt="" />
				<span>{ic.label}</span>
			</button>
		{/each}
	</div>

	<!-- Windows -->
	{#each Object.values(wins) as w (w.id)}
		<div
			class="window"
			class:minimized={w.minimized}
			class:maximized={w.maximized}
			class:active={topId() === w.id && !w.minimized}
			use:storeRef={{ id: w.id }}
			style={winStyle(w)}
			on:mousedown={() => bringToFront(w.id)}
			aria-label={`${w.title} window`}
			role="dialog"
			tabindex="0"
		>
			<header
				class="titlebar"
				on:dblclick={() => toggleMax(w.id)}
				on:pointerdown={(e: PointerEvent) => onTitlebarPointerDown(w.id, e)}
				role="button"
				aria-label="Drag window"
				tabindex="0"
				on:keydown={(e: KeyboardEvent) => {
					if (e.key === "Enter" || e.key === " ") toggleMax(w.id);
				}}
			>
				<div class="title">
					<svg width="12" height="12" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
						<rect
							x="6"
							y="6"
							width="22"
							height="14"
							rx="2"
							fill="#0d1b2a"
							stroke="#0b0b0b"
							stroke-width="2"
						/>
						<rect x="8" y="8" width="18" height="10" fill="#60a5fa" />
					</svg>
					<span>{w.title}</span>
				</div>
				<div class="buttons">
					<button
						class="btn"
						aria-label="Minimize"
						title="Minimize"
						on:click|stopPropagation={() => toggleMin(w.id)}
					>
						<svg
							width="10"
							height="8"
							viewBox="0 0 10 8"
							xmlns="http://www.w3.org/2000/svg"
							shape-rendering="crispEdges"
						>
							<rect x="1" y="6" width="8" height="1" fill="#000" />
						</svg>
					</button>
					<button
						class="btn"
						aria-label={w.maximized ? "Restore" : "Maximize"}
						title={w.maximized ? "Restore" : "Maximize"}
						on:click|stopPropagation={() => toggleMax(w.id)}
					>
						{#if w.maximized}
							<svg
								width="10"
								height="8"
								viewBox="0 0 10 8"
								xmlns="http://www.w3.org/2000/svg"
								shape-rendering="crispEdges"
							>
								<rect x="3" y="2" width="6" height="5" fill="none" stroke="#000" stroke-width="1" />
								<rect x="1" y="1" width="6" height="5" fill="none" stroke="#000" stroke-width="1" />
							</svg>
						{:else}
							<svg
								width="10"
								height="8"
								viewBox="0 0 10 8"
								xmlns="http://www.w3.org/2000/svg"
								shape-rendering="crispEdges"
							>
								<rect x="1" y="1" width="8" height="6" fill="none" stroke="#000" stroke-width="1" />
							</svg>
						{/if}
					</button>
					<button
						class="btn close"
						aria-label="Close"
						title="Close"
						on:click|stopPropagation={() => closeWindow(w.id)}>✕</button
					>
				</div>
			</header>

			<div class="content">
				<!-- Explorer chrome -->
				<div class="chrome">
					<div class="menubar" aria-hidden="true">
						<span>File</span><span>View</span><span>Go</span><span>Tools</span><span>Help</span>
					</div>

					<div class="toolbar">
						<div class="tool-buttons" aria-hidden="true">
							<button type="button" class="tool-btn" title="Back">◄</button>
							<button type="button" class="tool-btn" title="Forward">►</button>
							<button type="button" class="tool-btn" title="Up">⤴</button>
							<div class="tool-sep"></div>
							<button type="button" class="tool-btn" title="Cut">✂</button>
							<button type="button" class="tool-btn" title="Copy">📄</button>
						</div>

						<form class="addr-bar" on:submit|preventDefault={e => onAddressSubmit(w.id, e)}>
							<label class="addr-label" for={`address-${w.id}`}>Address</label>
							<input
								class="address addr-input"
								id={`address-${w.id}`}
								type="text"
								spellcheck="false"
								placeholder="Type blog, projects, terminal"
								value={w.id}
							/>
							<button class="go addr-go" title="Go" aria-label="Go">↵</button>
						</form>
					</div>
				</div>

				{#if w.id === "projects"}
					<div class="pane"><h3>COMING SOON.</h3></div>
				{:else if w.id === "blog"}
					<div class="pane">
						<h3>Recent posts</h3>
						{#if allPosts.length}
							<ul class="posts">
								{#each allPosts as p}
									<li>
										<time>{p.date}</time>
										<a href={`/blog/${p.slug}`} target="_blank" rel="noopener">{p.title}</a>
									</li>
								{/each}
							</ul>
						{:else}
							<p>No posts found.</p>
						{/if}
					</div>
				{:else}
					<!-- TERMINAL -->
					<div class="terminal">
						<pre class="term-header"><i
								>Some basic commands work. You can open folders, or see a list of them! Why? Eh, why not.
(c) 2025 Areena Arora Das.</i
							></pre>
						{#each termHistory as line}<div class="term-line">{@html line}</div>{/each}
						<form class="term-input" on:submit|preventDefault={runCommand}>
							<span class="prompt">$</span>
							<input
								type="text"
								bind:value={termInput}
								class="term-field"
								autocomplete="off"
								autocapitalize="off"
								autocorrect="off"
								spellcheck="false"
							/>
						</form>
					</div>
				{/if}
			</div>
		</div>
	{/each}

	<!-- TASKBAR -->
	<div class="taskbar" role="toolbar" aria-label="Taskbar">
		<button class="start" on:click={toggleStart} aria-expanded={startOpen}>
			<span class="start-logo" aria-hidden="true">
				<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
					<rect width="16" height="16" fill="#008000" />
					<rect x="1" y="1" width="14" height="14" fill="#00a000" />
					<path d="M3 4h4v4H3zM9 4h4v4H9zM3 8h4v4H3zM9 8h4v4H9z" fill="#fff" />
				</svg>
			</span>
			<span>Start</span>
		</button>

		<div class="tasks">
			{#each Object.values(wins) as w (w.id)}
				<button
					class="task {topId() === w.id && !w.minimized ? 'active' : ''} {w.minimized
						? 'minimized'
						: ''}"
					on:click={() => onTaskClick(w.id)}
					aria-pressed={topId() === w.id && !w.minimized}
					aria-label={`Show ${w.title}`}
					title={w.title}
				>
					<svg width="12" height="12" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
						<rect
							x="6"
							y="6"
							width="22"
							height="14"
							rx="2"
							fill="#0d1b2a"
							stroke="#0b0b0b"
							stroke-width="2"
						/>
						<rect x="8" y="8" width="18" height="10" fill="#60a5fa" />
					</svg>
					<span>{w.title}</span>
				</button>
			{/each}
		</div>

		<div class="tray"><div class="clock" aria-label="Clock">{time}</div></div>
	</div>

	{#if startOpen}
		<div
			class="start-menu"
			role="menu"
			tabindex="0"
			on:click|self={closeStart}
			on:keydown={(e: KeyboardEvent) => {
				if (e.key === "Escape") closeStart();
			}}
			aria-label="Start menu"
		>
			<aside class="start-sidebar">not windows</aside>
			<ul class="start-items">
				<li>
					<button type="button" role="menuitem" on:click={() => (window.location.href = "/")}>
						<span class="micon">💻</span> Areena
					</button>
				</li>
				<li>
					<button type="button" role="menuitem" on:click={startOpenProjects}>
						<span class="micon">🗂️</span> Projects ▸
					</button>
				</li>
				<li>
					<button type="button" role="menuitem" on:click={startOpenBlog}>
						<span class="micon">📄</span> Blog ▸
					</button>
				</li>
				<li>
					<button type="button" role="menuitem" on:click={startOpenTerminal}>
						<span class="micon">🖥️</span> Terminal
					</button>
				</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	/* Wallpaper */
	:global(body.win96-wallpaper) {
		margin: 0;
		background: url("/bliss.webp") no-repeat center center fixed;
		background-size: cover;
	}

	/* Make site header transparent over the wallpaper */
	:global(body.win96-wallpaper) :global(header),
	:global(body.win96-wallpaper) :global(.site-header),
	:global(body.win96-wallpaper) :global(nav) {
		background: transparent !important;
	}

	/* Kill stray horizontal scroll everywhere (properly scoped for Svelte) */
	:global(html),
	:global(body) {
		overflow-x: hidden;
	}

	:root {
		/* set this to your header's actual height if different */
		--site-header-h: 56px;

		--w95-face: #c0c0c0;
		--w95-light: #fff;
		--w95-highlight: #dfdfdf;
		--w95-shadow: #808080;
		--w95-dark: #404040;
		--w95-blue: #000080;
		--w95-blue-lit: #1084d0;
		--w95-blue-inactive: #8080a0;
	}

	.desktop {
		/* subtract header so the page height = viewport height */
		min-height: calc(100vh - var(--site-header-h));
		background: transparent;
		image-rendering: pixelated;
		position: relative;
		overflow: hidden;
	}

	.icons-layer {
		position: absolute;
		top: 0;
		right: 0;
		bottom: var(--taskbar-h); /* keep icons above the taskbar without increasing layout height */
		left: 0;
		pointer-events: auto;
		padding-left: 15px; /* left gutter for icons */
		box-sizing: border-box;
		max-width: 100%;
	}

	/* Icon look */
	.icon {
		position: absolute;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.icon-img {
		width: 82px;
		height: 82px;
		image-rendering: pixelated;
		filter: saturate(0.95) contrast(1.02);
	}
	.icon span {
		margin-top: 4px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		color: #000;
		background: var(--w95-face);
		padding: 6px 8px;
		box-shadow:
			0 0 0 1px var(--w95-light) inset,
			0 0 0 2px var(--w95-highlight) inset,
			0 0 0 3px var(--w95-shadow) inset;
	}

	/* Windows */
	.window {
		position: absolute;
		background: var(--w95-face);
		border-radius: 0;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
	}
	.window::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		box-shadow:
			0 0 0 1px var(--w95-light) inset,
			0 0 0 2px var(--w95-highlight) inset,
			0 0 0 3px var(--w95-shadow) inset,
			0 0 0 4px var(--w95-dark) inset;
	}
	.window.minimized {
		height: 30px;
		opacity: 0;
		pointer-events: none;
	}
	.window:not(.maximized)::after {
		content: "";
		position: absolute;
		right: 6px;
		bottom: 6px;
		width: 12px;
		height: 12px;
		background: linear-gradient(135deg, transparent 6px, var(--w95-shadow) 6px 7px, transparent 7px),
			linear-gradient(135deg, transparent 9px, var(--w95-shadow) 9px 10px, transparent 10px),
			linear-gradient(135deg, transparent 12px, var(--w95-shadow) 12px 13px, transparent 13px);
		opacity: 0.8;
	}

	.titlebar {
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 4px 0 6px;
		color: #fff;
		background: linear-gradient(180deg, var(--w95-blue-lit), var(--w95-blue));
		border-bottom: 1px solid var(--w95-dark);
		cursor: move;
		user-select: none;
	}
	:global(body.dragging) .titlebar {
		cursor: grabbing;
	}
	.window:not(.active) .titlebar {
		background: linear-gradient(180deg, #bfc6e3, var(--w95-blue-inactive));
		color: #e6e6e6;
	}
	.title {
		display: flex;
		align-items: center;
		gap: 6px;
		font:
			700 13px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
	}
	.window.active .title span {
		outline: 1px dotted #fff;
		outline-offset: -2px;
	}
	.buttons {
		display: flex;
		gap: 3px;
	}
	.btn {
		width: 30px;
		height: 20px;
		padding: 0;
		display: grid;
		place-items: center;
		background: var(--w95-face);
		border: none;
		box-shadow:
			0 0 0 1px var(--w95-light) inset,
			0 0 0 2px var(--w95-highlight) inset,
			0 0 0 3px var(--w95-shadow) inset;
	}
	.btn:hover {
		background: #d6d6d6;
	}
	.btn:active {
		box-shadow:
			0 0 0 1px var(--w95-shadow) inset,
			0 0 0 2px var(--w95-dark) inset,
			0 0 0 3px var(--w95-light) inset;
	}
	.btn.close {
		background: #e9c9c9;
	}
	.btn.close:hover {
		background: #e3b9b9;
	}

	.content {
		padding: 10px;
		overflow: auto;
		flex: 1;
	}
	.pane {
		background: #fff;
		padding: 10px;
		box-shadow:
			0 0 0 1px var(--w95-light) inset,
			0 0 0 2px var(--w95-highlight) inset,
			0 0 0 3px var(--w95-shadow) inset;
	}
	.pane h3 {
		margin: 0 0 6px;
		font:
			700 13px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
	}
	.list,
	.posts {
		margin: 0;
		padding-left: 18px;
		line-height: 1.65;
	}
	.posts time {
		font-weight: 700;
		margin-right: 8px;
	}

	/* Terminal */
	.terminal {
		background: #000;
		color: #00e5ff;
		height: 100%;
		padding: 10px;
		font:
			600 14px/1.4 "Courier New",
			ui-monospace,
			monospace;
		overflow: auto;
	}
	.term-header {
		color: #00e5ff;
		margin: 0 4 4px;
		font-style: italic;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
	}
	.term-line {
		color: #00e5ff;
		font:
			600 14px/1.4 "Courier New",
			ui-monospace,
			monospace;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
	}
	.term-input {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 2px;
	}
	.prompt {
		color: #00e5ff;
	}
	.term-field {
		background: transparent;
		border: none;
		outline: none;
		color: #00e5ff;
		font:
			600 14px/1.4 "Courier New",
			ui-monospace,
			monospace;
		flex: 1;
	}

	/* Taskbar */
	.taskbar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: var(--taskbar-h);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		background: #c0c0c0;
		padding: 2px 4px;
		box-shadow:
			inset 1px 1px #fff,
			inset -1px -1px #404040;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		z-index: 9999;
	}
	.start {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 14px;
		cursor: pointer;
		background: #c0c0c0;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
		font:
			700 18px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
	}
	.start:active {
		border: 2px solid #404040;
		border-right-color: #fff;
		border-bottom-color: #fff;
	}
	.start-logo {
		display: inline-grid;
		place-items: center;
		width: 16px;
		height: 16px;
	}

	.tasks {
		flex: 1;
		display: flex;
		gap: 4px;
		margin: 0 6px;
	}
	.task {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		cursor: pointer;
		background: #c0c0c0;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
	}
	.task.active,
	.task:active {
		border: 2px solid #404040;
		border-right-color: #fff;
		border-bottom-color: #fff;
		background: #dfdfdf;
	}
	.task.minimized {
		opacity: 0.65;
	}
	.task svg {
		width: 12px;
		height: 12px;
	}

	.tray {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.clock {
		padding: 2px 8px;
		background: #c0c0c0;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
	}

	/* Start menu */
	.start-menu {
		position: absolute;
		left: 0;
		bottom: var(--taskbar-h);
		width: 260px;
		background: #c0c0c0;
		display: flex;
		box-shadow:
			inset 1px 1px #fff,
			inset -1px -1px #404040;
		border-top: 1px solid #fff;
		border-left: 1px solid #fff;
		border-right: 1px solid #404040;
		border-bottom: 1px solid #404040;
		overflow: hidden;
	}
	.start-sidebar {
		flex: 0 0 30px;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		background: #004080;
		color: #fff;
		font:
			700 14px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.start-items {
		list-style: none;
		margin: 0;
		padding: 12px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.start-items li {
		padding: 0;
	}
	.start-items li button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		cursor: pointer;
		background: #dcdcdc;
		color: #000;
		font:
			700 15px/1.2 "MS Sans Serif",
			Tahoma,
			system-ui;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
		box-shadow:
			inset 1px 1px #fff,
			inset -1px -1px #9c9c9c;
	}
	.start-items li button:hover {
		background: #efefef;
		border-color: #404040;
		border-right-color: #fff;
		border-bottom-color: #fff;
	}

	.micon {
		width: 20px;
		height: 20px;
		display: inline-grid;
		place-items: center;
	}

	/* Explorer chrome */
	.chrome {
		background: #c0c0c0;
		margin: -6px -6px 8px;
		box-shadow:
			inset 1px 1px #fff,
			inset -1px -1px #404040;
	}
	.menubar {
		display: flex;
		gap: 14px;
		padding: 4px 8px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		color: #000;
		border-bottom: 1px solid #9c9c9c;
		background: #c0c0c0;
	}
	.menubar span {
		padding: 2px 4px;
		border: 1px solid transparent;
	}
	.menubar span:hover {
		background: #dfdfdf;
		border-color: #fff #404040 #404040 #fff;
	}
	.toolbar {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 6px;
		padding: 6px;
		align-items: center;
	}
	.tool-buttons {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #c0c0c0;
		padding: 4px;
		box-shadow:
			inset 1px 1px #fff,
			inset -1px -1px #404040;
	}
	.tool-btn {
		min-width: 24px;
		height: 22px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		background: #c0c0c0;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
		padding: 0 6px;
		cursor: default;
	}
	.tool-btn:active {
		border-color: #404040;
		border-right-color: #fff;
		border-bottom-color: #fff;
		background: #dfdfdf;
	}
	.tool-sep {
		width: 1px;
		height: 18px;
		margin: 0 2px;
		background:
			linear-gradient(#fff, #fff) left/1px 100% no-repeat,
			linear-gradient(#404040, #404040) right/1px 100% no-repeat;
	}
	.addr-label {
		padding: 0 6px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
	}
	.address {
		height: 24px;
		padding: 0 6px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		color: #000;
		background: #fff;
		border: none;
		box-shadow:
			inset 1px 1px #fff,
			inset 2px 2px #dfdfdf,
			inset -1px -1px #808080,
			inset -2px -2px #404040;
	}
	.address:focus {
		outline: none;
	}
	.go {
		height: 24px;
		min-width: 30px;
		font:
			700 12px/1 "MS Sans Serif",
			Tahoma,
			system-ui;
		background: #c0c0c0;
		border: 2px solid #fff;
		border-right-color: #404040;
		border-bottom-color: #404040;
	}
	.go:active {
		border-color: #404040;
		border-right-color: #fff;
		border-bottom-color: #fff;
		background: #dfdfdf;
	}
	.addr-bar {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 6px;
	}
	.addr-input {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}
	.addr-go {
		flex: 0 0 auto;
		width: 28px;
		height: 20px;
		padding: 0;
	}

	/* Unify type */
	.window,
	.taskbar,
	.start-menu,
	.titlebar,
	.icon span,
	.start-items li {
		font-family: "MS Sans Serif", Tahoma, sans-serif;
		font-size: 13px;
		letter-spacing: 0;
		line-height: 1.2;
	}

	/* --- stacking order so icons are tappable --- */
	.desktop {
		position: relative;
	}
	.icons-layer {
		z-index: 10;
	} /* icons */
	.window {
		z-index: 20;
	} /* app windows */
	.start-menu {
		z-index: 30;
	} /* start menu over windows */
	.taskbar {
		z-index: 40;
	} /* taskbar on top */

	/* --- make icon tap targets reliable on touch --- */
	.icon {
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}
	.icon::before {
		content: "";
		position: absolute;
		inset: -10px;
	} /* enlarge hitbox */
	.icons-layer,
	.icon {
		pointer-events: auto;
	}

	/* --- mobile tweaks --- */
	@media (max-width: 820px) {
		:root {
			--taskbar-h: 48px;
		}

		.desktop {
			height: calc(100svh - var(--site-header-h)); /* header accounted for */
			overflow: clip; /* no vertical scroll */
		}

		/* keep icons above taskbar + safe area on mobile */
		.icons-layer {
			bottom: calc(var(--taskbar-h) + env(safe-area-inset-bottom, 0px));
		}

		/* smaller icons on mobile */
		.icon-img {
			width: 64px;
			height: 64px;
		}
		.icon {
			gap: 4px;
		}
		.icon span {
			font-size: 12px;
			padding: 6px 8px;
		}

		/* belt & suspenders: no horizontal scroll */
		:global(html),
		:global(body) {
			overflow-x: hidden;
		}

		/* keep windows usable on small screens */
		.window {
			max-width: 96vw;
			max-height: calc(100vh - var(--taskbar-h) - 20px);
		}
		.content {
			overflow: auto;
		}
	}
</style>
