<script lang="ts">
	import { Game } from '$lib/jackpot/game';

	const JACKPOT = ['!', 'J', 'A', 'C', 'K', 'P', 'O', 'T', '!'];

	let game = new Game();

	// UI state
	let rollTotal: number | null = null;
	let diceCount: 1 | 2 = 2;
	let selected: number[] = [];
	let msg = '';

	// reactive selected sum
	$: selectedSum = selected.reduce((a, b) => a + b, 0);

	// subtle “shut” animation
	let justShut = new Set<number>();
	function pulseShut(tiles: number[]) {
		justShut = new Set(tiles);
		setTimeout(() => (justShut = new Set()), 220);
	}

	// leaderboard (session-only)
	type Run = { id: number; name: string; finalScore: number; turns: number; endedAt: number };
	let runs: Run[] = [];
	let nextRunId = 1;
	let turns = 0;

	const DEFAULT_NAME = 'Anon';
	function normName(s: string) {
		const n = (s ?? '').trim();
		if (!n) return DEFAULT_NAME;
		return n.length > 12 ? n.slice(0, 12) : n;
	}

	function logRun(finalScore: number) {
		runs = [
			{
				id: nextRunId++,
				name: DEFAULT_NAME,
				finalScore,
				turns,
				endedAt: Date.now()
			},
			...runs
		].slice(0, 10);
	}

	// ✅ correct ranking: score ↑, turns ↑, latest ↑
	$: rankedRuns = [...runs].sort((a, b) => {
		if (a.finalScore !== b.finalScore) return a.finalScore - b.finalScore;
		if (a.turns !== b.turns) return a.turns - b.turns;
		return b.endedAt - a.endedAt;
	});

	$: bestScore = rankedRuns.length ? rankedRuns[0].finalScore : null;

	function canChooseDice() {
		return game.canChooseDieCount();
	}

	let hasLoggedThisGame = false;

	function rollDice() {
		msg = '';
		selected = [];

		rollTotal = game.roll(undefined, diceCount);

		if (game.over && !hasLoggedThisGame) {
			logRun(game.score());
			hasLoggedThisGame = true;
			rollTotal = null;
		}

		game = game;
	}

	function toggleTile(t: number) {
		if (rollTotal === null) return;
		if (!game.tiles[t]) return;

		selected = selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t];

		msg = '';
	}

	function submitMove() {
		msg = '';
		if (rollTotal === null || selected.length === 0) return;

		const moveTiles = [...selected];

		if (!game.move(selected)) {
			msg = 'That combination doesn’t match the roll.';
			return;
		}

		turns += 1;
		pulseShut(moveTiles);
		selected = [];

		if (game.over) {
			rollTotal = null;
			if (!hasLoggedThisGame) {
				logRun(game.score());
				hasLoggedThisGame = true;
			}
			return;
		}

		rollDice();
	}

	function reset() {
		game = new Game();
		rollTotal = null;
		diceCount = 2;
		selected = [];
		msg = '';
		justShut = new Set();
		turns = 0;
		hasLoggedThisGame = false;
	}

	function newGame() {
		reset();
	}
</script>

<div class="page">
	<div class="wrap">
		<header class="top">
			<div>
				<h1>Jackpot!</h1>
				<p class="sub">Shut the Box</p>
			</div>
			<div class="score">
				<div class="label">Score</div>
				<div class="value">{game.score()}</div>
			</div>
		</header>

		<section class="board">
			<div class="leftCol">
				<div class="howto">
					<strong>How to play</strong>
					<p>
						Roll the dice, select tiles that add up to the roll, and submit. If no move exists, the
						game ends. Lower score is better.
					</p>
				</div>

				<div class="tilesFrame">
					<div class="tiles">
						{#each Array.from({ length: game.tilesMax }, (_, i) => i + 1) as t}
							<button
								class="tile {selected.includes(t) ? 'sel' : ''} {game.tiles[t]
									? ''
									: 'closed'} {justShut.has(t) ? 'shutPulse' : ''}"
								on:click={() => toggleTile(t)}
								disabled={rollTotal === null || !game.tiles[t]}
							>
								{game.tiles[t] ? t : JACKPOT[t - 1]}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="rightCol">
				<div class="panel">
					<div class="meta">
						<div>
							<div class="k">Roll</div>
							<div class="v">{rollTotal ?? '—'}</div>
						</div>
						<div>
							<div class="k">Selected</div>
							<div class="v">{selectedSum}</div>
						</div>
					</div>

					{#if canChooseDice()}
						<div class="diceChoice">
							<label><input type="radio" bind:group={diceCount} value="1" />1</label>
							<label><input type="radio" bind:group={diceCount} value="2" />2</label>
						</div>
					{/if}

					<div class="actions">
						<button on:click={rollDice} disabled={rollTotal !== null || game.over}>Roll</button>
						<button on:click={submitMove} disabled={rollTotal === null || selected.length === 0}
							>Submit</button
						>
						<button on:click={reset}>Reset</button>
					</div>

					{#if msg}<p>{msg}</p>{/if}

					{#if game.over}
						<div class="over">
							{#if game.score() === 0}
								<strong>You won!! JACKPOT 🎉</strong>
							{:else}
								<strong>Game over — final score {game.score()}</strong>
							{/if}
						</div>
					{/if}
				</div>

				<div class="leaderboard">
					<div class="lbHead">
						<strong>Leaderboard</strong>
						{#if bestScore !== null}<span>Best: {bestScore}</span>{/if}
					</div>

					<p class="hint">Click a name to edit.</p>

					{#if rankedRuns.length === 0}
						<p>Finish a game to log a score.</p>
					{:else}
						<table>
							<thead>
								<tr><th>#</th><th>Name</th><th>Final</th><th>Turns</th></tr>
							</thead>
							<tbody>
								{#each rankedRuns as r, i}
									<tr>
										<td>{i + 1}</td>
										<td>
											<input
												value={r.name}
												on:input={(e) => {
													const v = (e.currentTarget as HTMLInputElement).value;
													runs = runs.map((x) => (x.id === r.id ? { ...x, name: normName(v) } : x));
												}}
											/>
										</td>
										<td>{r.finalScore}</td>
										<td>{r.turns}</td>
									</tr>
								{/each}
							</tbody>
						</table>

						<div class="lbActions">
							<button on:click={() => (runs = [])}>Clear</button>
							<button on:click={newGame}>New game</button>
						</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	:global(body) {
		background: #fbfaf7;
	}

	.page {
		background: radial-gradient(1200px 500px at 30% 10%, rgba(26, 92, 56, 0.06), transparent 60%);
	}

	.wrap {
		max-width: 1040px;
		margin: 0 auto;
		padding: 2.25rem 1.25rem 3.5rem;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.2rem, 4.2vw, 3.2rem);
		line-height: 1;
		letter-spacing: -0.01em;
	}

	.sub {
		margin: 0.45rem 0 0;
		opacity: 0.7;
	}

	.score {
		text-align: right;
	}

	.score .label {
		font-size: 0.95rem;
		opacity: 0.7;
	}

	.score .value {
		font-size: 2.2rem;
		font-weight: 800;
	}

	.board {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	@media (min-width: 920px) {
		.board {
			grid-template-columns: 1.35fr 0.65fr;
			align-items: start;
			gap: 1.5rem;
		}
	}

	.leftCol {
		display: grid;
		gap: 1rem;
	}

	.howto {
		border-radius: 16px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
		padding: 1.4rem 1.5rem;
	}

	.howtoTitle {
		font-weight: 800;
		margin-bottom: 0.35rem;
		font-size: 1.1rem;
	}

	.howtoText {
		margin: 0;
		line-height: 1.65;
		opacity: 0.85;
		font-size: 1.05rem;
	}

	.tilesFrame {
		border-radius: 18px;
		padding: 14px;
		background: linear-gradient(135deg, #e6caa3, #d5b08a);
		border: 1px solid rgba(0, 0, 0, 0.12);
		box-shadow:
			0 14px 34px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.tiles {
		border-radius: 14px;
		padding: 16px;
		background: radial-gradient(
			900px 300px at 30% 30%,
			rgba(30, 120, 70, 0.35),
			rgba(18, 77, 47, 0.92)
		);
		border: 1px solid rgba(0, 0, 0, 0.18);
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		gap: 0.6rem;
	}

	.tile {
		aspect-ratio: 1 / 1;
		border-radius: 14px;
		background: linear-gradient(135deg, #fff7ea, #f0d9b9);
		border: 2px solid rgba(0, 0, 0, 0.18);
		box-shadow:
			0 8px 16px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		font-size: 1.25rem;
		font-weight: 800;
		cursor: pointer;
		transition:
			transform 160ms ease,
			background-color 160ms ease,
			border-color 160ms ease,
			opacity 160ms ease,
			box-shadow 160ms ease;
		will-change: transform;
	}

	.tile:hover:enabled {
		transform: translateY(-1px);
		box-shadow:
			0 10px 18px rgba(0, 0, 0, 0.14),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.tile:active:enabled {
		transform: translateY(0px) scale(0.98);
	}

	.tile.sel {
		border-color: rgba(0, 0, 0, 0.55);
		background: linear-gradient(135deg, #ffd36a, #f1b95a);
	}

	.tile.closed {
		opacity: 0.55;
		cursor: not-allowed;
		filter: grayscale(0.25);
	}

	@keyframes shutPulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(0.92);
		}
		100% {
			transform: scale(1);
		}
	}

	.tile.shutPulse {
		animation: shutPulse 200ms ease-out;
	}

	.rightCol {
		display: grid;
		align-content: start;
		gap: 1.2rem;
	}

	.panel {
		border-radius: 18px;
		padding: 1.6rem;
		border: 1px solid rgba(0, 0, 0, 0.18);
		background: linear-gradient(180deg, #ffffff 0%, #f6f7f5 100%);
		box-shadow:
			0 18px 40px rgba(0, 0, 0, 0.12),
			0 2px 6px rgba(0, 0, 0, 0.06);
	}

	.meta {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.1rem;
		margin-bottom: 1.1rem;
	}

	.k {
		font-size: 1rem;
		opacity: 0.65;
	}

	.v {
		font-size: 1.6rem;
		font-weight: 900;
	}

	.diceChoice {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0.4rem 0 1.2rem;
	}

	.radio {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.actions {
		display: flex;
		gap: 0.9rem;
		flex-wrap: wrap;
		margin-top: 0.4rem;
	}

	/* ✅ FIXED + BIGGER BUTTONS */
	:global(.btn) {
		border-radius: 14px;
		border: 1px solid rgba(0, 0, 0, 0.35);
		padding: 0.9rem 1.4rem;
		background: white;
		cursor: pointer;
		font-size: 1.1rem;
		min-height: 44px;
	}

	:global(.btn:disabled) {
		opacity: 0.45;
		cursor: not-allowed;
	}

	:global(.btn.primary) {
		background: #004217;
		color: white;
		border-color: rgba(0, 0, 0, 0.55);
	}

	:global(.btn.primary:disabled) {
		background: rgba(111, 131, 118, 0.45);
		color: rgba(255, 255, 255, 0.7);
		border-color: rgba(0, 0, 0, 0.25);
	}

	:global(.btn.ghost) {
		background: transparent;
	}

	.msg {
		margin: 1rem 0 0;
		opacity: 0.85;
		font-size: 1rem;
	}

	.over {
		margin-top: 1.1rem;
		padding-top: 1.1rem;
		border-top: 1px solid rgba(0, 0, 0, 0.12);
	}

	.overTitle {
		font-weight: 900;
		font-size: 1.25rem;
	}

	.overSub {
		margin-top: 0.3rem;
		opacity: 0.85;
		font-size: 1rem;
	}

	.leaderboard {
		border-radius: 18px;
		padding: 1.3rem 1.4rem;
		border: 1px solid rgba(0, 0, 0, 0.16);
		background: rgba(255, 255, 255, 0.82);
		box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
	}

	.lbHead {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 0.8rem;
	}

	.lbActions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}
</style>
