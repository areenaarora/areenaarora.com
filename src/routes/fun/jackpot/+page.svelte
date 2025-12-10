<script lang="ts">
	import { onMount } from 'svelte';

	let appEl: HTMLDivElement; // wrapper so we never touch document.body

	onMount(() => {
		const $ = (sel: string) => appEl.querySelector(sel) as HTMLElement;

		const tilesEl = $('#tiles');
		const diceEl = $('#dice');
		const statusEl = $('#status');
		const scoreEl = $('#score');
		const endEl = $('#end');
		const rollBtn = $('#rollBtn') as HTMLButtonElement;
		const submitBtn = $('#submitBtn') as HTMLButtonElement;
		const undoBtn = $('#undoBtn') as HTMLButtonElement;
		const newGameBtn = $('#newGame') as HTMLButtonElement;
		const autoBtn = $('#autoPlay') as HTMLButtonElement;

		type State = {
			open: Set<number>;
			selected: Set<number>;
			dice: number[];
			history: { dice: number[]; move: number[] }[];
			autoplay: boolean;
			animating: boolean;
		};
		let state: State;
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

		function newGame() {
			state = {
				open: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]),
				selected: new Set(),
				dice: [],
				history: [],
				autoplay: false,
				animating: false
			};
			endEl.textContent = '';
			render();
			updateUI();
		}

		const sum = (it: Iterable<number>) => Array.from(it).reduce((a, b) => a + b, 0);
		const openArr = () => Array.from(state.open).sort((a, b) => a - b);
		const selectedArr = () => Array.from(state.selected).sort((a, b) => a - b);
		const mustUseTwoDice = () => [7, 8, 9].some((n) => state.open.has(n));
		const r1to6 = () => 1 + Math.floor(Math.random() * 6);

		function rollDice() {
			if (state.dice.length && selectedArr().length === 0) return;
			state.selected.clear();
			state.dice = mustUseTwoDice() ? [r1to6(), r1to6()] : [r1to6()];

			const total = sum(state.dice);
			const combos = findCombos(openArr(), total);
			if (combos.length === 0) {
				endGame();
			}
			render();
			updateUI();

			if (state.autoplay && !isOver()) setTimeout(() => autoPickAndSubmit(), 250);
		}

		function findCombos(nums: number[], target: number) {
			const res: number[][] = [];
			function backtrack(start: number, path: number[], s: number) {
				if (s === target && path.length) {
					res.push(path.slice());
					return;
				}
				if (s >= target) return;
				for (let i = start; i < nums.length; i++) {
					path.push(nums[i]);
					backtrack(i + 1, path, s + nums[i]);
					path.pop();
				}
			}
			backtrack(0, [], 0);
			return res.sort((a, b) => a.length - b.length || sum(a) - sum(b));
		}

		// small helper for dice layout reused in template
		function getPips(d: number): [number, number][] {
			const pos: Record<string, [number, number]> = {

			if (s === 0) return false;
			return s === total;
		}

		async function applyMove() {
			if (!legalSelection() || state.animating) return;
			state.animating = true;
			submitBtn.disabled = true;
			rollBtn.disabled = true;
			const move = selectedArr();

			const flaps = move
				.map((n) => appEl.querySelector(`.tile[data-n="${n}"] .flap`) as HTMLElement)
				.filter(Boolean);
			flaps.forEach((f) => f.classList.add('is-flipping'));
			await sleep(340);

			move.forEach((n) => state.open.delete(n));
			state.history.push({ dice: state.dice.slice(), move });
			state.selected.clear();
			state.dice = [];
			state.animating = false;
			render();
			updateUI();
			if (!isOver()) setTimeout(() => rollDice(), 300);
		}

		function undo() {
			const last = state.history.pop();
			if (!last) return;
			last.move.forEach((n) => state.open.add(n));
			state.selected.clear();
			state.dice = last.dice;
			render();
			updateUI();
		}

		function endGame() {
			const sc = sum(state.open);
			endEl.textContent =
				sc === 0 ? 'Shut the Box! Perfect score.' : `No moves. Final score: ${sc}`;
			if (sc !== 0) flashMessage('No moves possible, game over');
			render();
			updateUI(true);
		}

		function flashMessage(msg: string) {
			const flashRoot = $('#flash-root');
			const flash = document.createElement('div');
			flash.textContent = msg;
			flash.style.position = 'absolute';
			flash.style.top = '50%';
			flash.style.left = '50%';
			flash.style.transform = 'translate(-50%,-50%)';
			flash.style.background = '#cf1322';
			flash.style.color = '#fff';
			flash.style.padding = '12px 20px';
			flash.style.borderRadius = '8px';
			flash.style.fontWeight = '700';
			flash.style.zIndex = '5';
			flashRoot.appendChild(flash);
			setTimeout(() => flash.remove(), 2000);
		}

		const isOver = () => endEl.textContent !== '';

		function toggleTile(n: number) {
			if (isOver()) return;
			if (!state.open.has(n)) return;
			if (!state.dice.length) return;
			const target = sum(state.dice);

			const sel = new Set(state.selected);
			if (sel.has(n)) sel.delete(n);
			else sel.add(n);
			const s = sum(sel);
			if (s > target) return;

			const remaining = openArr().filter((x) => !sel.has(x));
			const need = target - s;
			const possible = need === 0 || findCombos(remaining, need).length > 0;
			if (!possible) return;
			state.selected = sel;
			renderTiles();
			updateButtons();
		}

		function autoPickAndSubmit() {
			if (!state.dice.length) {
				rollDice();
				return;
			}
			const target = sum(state.dice);
			const combos = findCombos(openArr(), target);
			if (combos.length === 0) {
				endGame();
				return;
			}

			let best = combos[0];
			let bestScore = Infinity;
			for (const combo of combos) {
				const remaining = openArr().filter((x) => !combo.includes(x));
				const sc = sum(remaining);
				if (sc < bestScore) {
					best = combo;
					bestScore = sc;
				}
			}
			state.selected = new Set(best);
			renderTiles();
			updateButtons();
			setTimeout(applyMove, 180);
		}

		function render() {
			renderTiles();
			renderDice();
			scoreEl.textContent = String(sum(state.open));
		}

		function renderTiles() {
			tilesEl.innerHTML = '';
			const total = sum(state.dice);
			const playable = state.dice.length
				? new Set(findCombos(openArr(), total).flat())
				: new Set<number>();

			for (let n = 1; n <= 9; n++) {
				const btn = document.createElement('button');
				btn.dataset.n = String(n);
				btn.className = 'tile ' + (state.open.has(n) ? 'open' : 'closed');

				const flap = document.createElement('div');
				flap.className = 'flap';
				const front = document.createElement('div');
				front.className = 'face front';
				front.textContent = String(n);
				const back = document.createElement('div');
				back.className = 'face back';
				btn.appendChild(back);
				flap.appendChild(front);
				btn.appendChild(flap);

				if (state.open.has(n)) {
					if (state.dice.length && playable.has(n)) btn.classList.add('selectable');
					if (state.selected.has(n)) btn.classList.add('selected');
					btn.addEventListener('click', () => toggleTile(n));
				}
				tilesEl.appendChild(btn);
			}
		}

		function renderDice() {
			diceEl.innerHTML = '';
			for (const d of state.dice) {
				const div = document.createElement('div');
				div.className = 'die';
				const pos: Record<string, [number, number]> = {
					TL: [25, 25],
					TR: [75, 25],
					ML: [25, 50],
					MR: [75, 50],
					BL: [25, 75],
					BR: [75, 75],
					C: [50, 50]
				};
				const layouts: Record<number, string[]> = {
					1: ['C'],
					2: ['TL', 'BR'],
					3: ['TL', 'C', 'BR'],
					4: ['TL', 'TR', 'BL', 'BR'],
					5: ['TL', 'TR', 'C', 'BL', 'BR'],
					6: ['TL', 'ML', 'BL', 'TR', 'MR', 'BR']
				};
				(layouts[d] || ['C']).forEach((k) => {
					const [x, y] = pos[k];
					const pip = document.createElement('span');
					pip.className = 'pip';
					pip.style.left = x + '%';
					pip.style.top = y + '%';
					div.appendChild(pip);
				});
				diceEl.appendChild(div);
			}
		}

		function updateButtons() {
			rollBtn.disabled = state.dice.length > 0 && sum(state.selected) !== sum(state.dice);
			submitBtn.disabled = !legalSelection();
			undoBtn.disabled = state.history.length === 0;
		}

		function updateUI(gameOver = false) {
			statusEl.textContent = !state.dice.length
				? `Press R to roll ${mustUseTwoDice() ? 'two' : 'one'} die.`
				: `Select tiles totalling ${sum(state.dice)}.`;
			updateButtons();
			if (gameOver) {
				rollBtn.disabled = true;
				submitBtn.disabled = true;
			}
			autoBtn.textContent = `Autoplay: ${state.autoplay ? 'On' : 'Off'}`;
		}

		// Events
		rollBtn.addEventListener('click', rollDice);
		submitBtn.addEventListener('click', applyMove);
		undoBtn.addEventListener('click', undo);
		newGameBtn.addEventListener('click', newGame);
		autoBtn.addEventListener('click', () => {
			state.autoplay = !state.autoplay;
			updateUI();
			if (state.autoplay && !state.dice.length && !isOver()) rollDice();
		});

		window.addEventListener('keydown', (e) => {
			if (e.key === 'r' || e.key === 'R') {
				e.preventDefault();
				if (!isOver()) rollDice();
			} else if (e.key === 'Enter') {
				e.preventDefault();
				applyMove();
			} else if (e.key === 'u' || e.key === 'U') {
				e.preventDefault();
				undo();
			} else if (/^[1-9]$/.test(e.key)) {
				e.preventDefault();
				toggleTile(parseInt(e.key, 10));
			} else if (e.key === 'a' || e.key === 'A') {
				e.preventDefault();
				state.autoplay = !state.autoplay;
				updateUI();
				if (state.autoplay && !state.dice.length && !isOver()) rollDice();
			}
		});

		newGame();
	});
</script>

<div class="app" bind:this={appEl}>
	<header>
		<h1>Shut the Box</h1>
		<div class="actions">
			<button id="newGame" class="secondary">New game</button>
			<button id="autoPlay" class="ghost" title="Toggle autoplay (greedy)">Autoplay: Off</button>
		</div>
	</header>

	<section class="board">
		<div id="flash-root" style="position:relative;"></div>
		<div class="hud">
			<div class="dice" id="dice"></div>
			<div class="status" id="status">Press <span class="kbd">R</span> to roll.</div>
			<div class="row">
				<button id="rollBtn" class="primary">Roll</button>
				<button id="submitBtn" class="btn" disabled>Submit move</button>
				<button id="undoBtn" class="btn" disabled>Undo</button>
			</div>
		</div>
		<div class="tiles" id="tiles"></div>
	</section>

	<footer class="footer">
		<div>Score: <span class="score" id="score">—</span></div>
		<div id="end"></div>
	</footer>
</div>

<style>
	:root {
		--bg: #f3f2ee;
		--panel: #faf9f6;
		--muted: #666;
		--text: #222;
		--accent: #d46b08;
		--accent2: #389e0d;
		--good: #389e0d;
		--bad: #cf1322;
		--shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		--radius: 10px;
		--wood: #e6c89f;
		--wood-dark: #b28d5d;
		--felt: #1e6935;
	}
	.app {
		width: min(860px, 95vw);
		background: var(--panel);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		overflow: hidden;
		border: 12px solid var(--wood);
		margin: 20px auto;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: var(--wood);
		color: #222;
	}
	header h1 {
		font-size: 18px;
		margin: 0;
		font-weight: 700;
	}
	header .actions {
		display: flex;
		gap: 10px;
	}
	button,
	.btn {
		border: 0;
		border-radius: 8px;
		padding: 6px 12px;
		background: #eee;
		color: #222;
		cursor: pointer;
		font-weight: 600;
		transition:
			transform 0.05s ease,
			background 0.2s ease,
			opacity 0.2s ease;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.primary {
		background: var(--accent);
		color: #fff;
	}
	.secondary {
		background: #ddd;
	}
	.ghost {
		background: transparent;
		color: var(--muted);
	}

	.board {
		padding: 16px;
		background: var(--felt);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		gap: 4px;
		margin: 16px 0;
		width: 100%;
		perspective: 900px;
	}
	.tile {
		aspect-ratio: 2 / 3;
		border-radius: 4px;
		display: grid;
		place-items: center;
		font-weight: 900;
		font-size: clamp(14px, 2.2vw, 22px);
		background: var(--wood);
		border: 2px solid var(--wood-dark);
		box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.25);
		user-select: none;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.tile.open {
		color: #222;
	}
	.tile.closed {
		color: #888;
		background: #d9d0c4;
	}
	.tile.selectable {
		outline: 2px solid #999;
	}
	.tile.selected {
		background: #fff5d6;
		outline: 3px solid var(--accent2);
		box-shadow: 0 0 12px 4px rgba(56, 158, 13, 0.6);
		transform: scale(1.08);
		z-index: 1;
	}

	.flap {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		backface-visibility: hidden;
		transform-origin: 50% 0%;
		transform: rotateX(0deg);
		transition: transform 0.32s cubic-bezier(0.25, 0.8, 0.25, 1);
	}
	.flap.is-flipping {
		transform: rotateX(-105deg);
	}
	.face {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.face.back {
		background: #d9d0c4;
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 0 14px;
		flex-wrap: wrap;
		color: #fff;
	}
	.dice {
		display: flex;
		gap: 10px;
		align-items: center;
		min-height: 54px;
	}
	.die {
		width: 48px;
		height: 48px;
		display: block;
		position: relative;
		border-radius: 6px;
		background: #fff;
		border: 2px solid #333;
		box-shadow: var(--shadow);
	}
	.pip {
		position: absolute;
		width: 8px;
		height: 8px;
		background: #222;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}
	.status {
		font-size: 14px;
		color: #fff;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--wood);
	}
	.score {
		font-weight: 800;
	}
	.kbd {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		background: #eee;
		border: 1px solid #bbb;
		border-radius: 4px;
		padding: 2px 5px;
		font-size: 12px;
		color: #333;
	}
</style>
