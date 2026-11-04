<script lang="ts">
	import { onMount } from 'svelte';
	import notes from './notes.json';

	let canvas: HTMLCanvasElement;
	let paused = false;
	let current = 0;
	const stops = ['journalism', 'tech?', 'AI?', 'what next?'];
	let chooseStop = (_index: number) => {};
	let setMotion = (_paused: boolean) => {};

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const context = ctx;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		paused = motion.matches;
		let width = 1000, height = 460, frame = 0, last = 0, elapsed = 0, phaseTime = 0;
		let pointer = { x: -1000, y: -1000 };
		let seed = 12345;
		const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
		const colours = ['#783beb', '#783beb', '#ed2590', '#ed2590', '#2878ef', '#2878ef'];
		const positions = [{ x: 420, y: 220 }, { x: 660, y: 150 }, { x: 665, y: 300 }, { x: 465, y: 240 }];
		const mask = document.createElement('canvas');
		mask.width = 1000; mask.height = 460;
		const maskCtx = mask.getContext('2d');
		if (!maskCtx) return;
		const targets = stops.map((text, i) => {
			maskCtx.clearRect(0, 0, 1000, 460);
			maskCtx.font = `700 ${i === 0 ? 96 : i === 3 ? 83 : 118}px monospace`;
			maskCtx.textAlign = 'center'; maskCtx.textBaseline = 'middle';
			maskCtx.fillText(text, positions[i].x, positions[i].y);
			const data = maskCtx.getImageData(0, 0, 1000, 460).data;
			const points: { x: number; y: number }[] = [];
			for (let y = 0; y < 460; y += 5) for (let x = 0; x < 1000; x += 5) {
				if (data[(y * 1000 + x) * 4 + 3] > 120) points.push({ x, y });
			}
			return points;
		});
		const particles = Array.from({ length: 1150 }, (_, i) => {
			const point = targets[0][i % targets[0].length];
			return { x: point.x + (random() - .5) * 25, y: point.y + (random() - .5) * 25, noise: random() * Math.PI * 2, speed: .7 + random(), colour: colours[Math.floor(random() * colours.length)], orbit: random() < .12 };
		});
		function resize() {
			const rect = canvas.getBoundingClientRect();
			width = rect.width; height = rect.height;
			const dpr = Math.min(devicePixelRatio || 1, 2);
			canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			draw(0);
		}
		function route(t: number) {
			return { x: 510 + Math.cos(t) * 310 + Math.sin(t * 3) * 35, y: 230 + Math.sin(t * 2) * 125 };
		}
		function draw(dt: number) {
			context.clearRect(0, 0, width, height);
			const scale = Math.min(width / 1000, height / 460);
			context.save(); context.translate((width - 1000 * scale) / 2, (height - 460 * scale) / 2); context.scale(scale, scale);
			// A map of detours, drawn with the same square units as the moving type.
			context.fillStyle = '#e9e3f6';
			for (let x = 22; x < 1000; x += 22) for (let y = 20; y < 460; y += 22) context.fillRect(x, y, 1.2, 1.2);
			context.strokeStyle = '#d9cef2'; context.lineWidth = 1;
			context.setLineDash([2, 6]); context.beginPath();
			for (let t = 0; t <= Math.PI * 2 + .03; t += .03) { const p = route(t); if (t === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y); }
			context.stroke(); context.setLineDash([]);
			// Fixed field notes remain readable while the pixel type explores.
			context.font = '11px monospace'; context.fillStyle = '#827092';
			context.fillText('01 / THE STARTING POINT', 65, 390);
			context.fillText('02 / A NEW TOOL?', 700, 65);
			context.fillText('03 / ANOTHER QUESTION', 720, 390);
			context.fillStyle = '#ed2590'; context.fillRect(64, 363, 9, 9);
			context.fillStyle = '#2878ef'; context.fillRect(700, 82, 9, 9);
			context.fillStyle = '#2878ef'; context.fillRect(720, 363, 9, 9);
			const scatter = paused ? 0 : Math.max(0, 1 - phaseTime / 1.3);
			particles.forEach((particle, i) => {
				const target = targets[current][i % targets[current].length];
				let tx = target.x, ty = target.y;
				if (particle.orbit) {
					const p = route(elapsed * .14 * particle.speed + particle.noise); tx = p.x; ty = p.y;
				} else {
					tx += Math.sin(particle.noise + elapsed * particle.speed) * scatter * 130;
					ty += Math.cos(particle.noise + elapsed * particle.speed) * scatter * 95;
				}
				const dx = particle.x - pointer.x, dy = particle.y - pointer.y, distance = Math.hypot(dx, dy);
				if (!paused && distance < 75 && distance > 0) { tx += dx / distance * (75 - distance) * 1.7; ty += dy / distance * (75 - distance) * 1.7; }
				const ease = paused ? 1 : 1 - Math.exp(-Math.min(dt, .05) * 4.5);
				particle.x += (tx - particle.x) * ease; particle.y += (ty - particle.y) * ease;
				context.globalAlpha = particle.orbit ? .42 : .9;
				context.fillStyle = particle.colour;
				context.fillRect(Math.round(particle.x / 5) * 5, Math.round(particle.y / 5) * 5, particle.orbit ? 3 : 3.8, particle.orbit ? 3 : 3.8);
			});
			context.globalAlpha = 1;
			const wanderer = route(elapsed * .38);
			context.fillStyle = '#ed2590'; context.fillRect(wanderer.x - 9, wanderer.y - 9, 18, 18);
			context.fillStyle = '#5d26c3'; context.fillRect(wanderer.x - 3, wanderer.y - 3, 6, 6);
			context.restore();
		}
		function animate(time: number) {
			const dt = last ? Math.min((time - last) / 1000, .05) : .016; last = time;
			if (!paused && !document.hidden) {
				elapsed += dt; phaseTime += dt;
				if (phaseTime > 5.5) { current = (current + 1) % stops.length; phaseTime = 0; }
				draw(dt);
			}
			frame = requestAnimationFrame(animate);
		}
		chooseStop = (index) => { current = index; phaseTime = 0; draw(.016); };
		setMotion = (value) => { paused = value; draw(.016); };
		const changeMotion = () => setMotion(motion.matches);
		const move = (event: PointerEvent) => { const r = canvas.getBoundingClientRect(); const scale = Math.min(r.width / 1000, r.height / 460); pointer = { x: (event.clientX - r.left - (r.width - 1000 * scale) / 2) / scale, y: (event.clientY - r.top - (r.height - 460 * scale) / 2) / scale }; };
		const leave = () => { pointer = { x: -1000, y: -1000 }; };
		const observer = new ResizeObserver(resize); observer.observe(canvas);
		canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave);
		motion.addEventListener('change', changeMotion);
		resize(); phaseTime = 2; draw(.016); frame = requestAnimationFrame(animate);
		return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); motion.removeEventListener('change', changeMotion); };
	});
</script>

<svelte:head>
	<title>areena2pointO | Areena Arora</title>
	<meta name="robots" content="noindex, nofollow" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet" />
	<meta name="description" content="An evolving sketch of journalism, technology and the questions in between." />
</svelte:head>

<main class="wandering-page">
	<div class="page-meta"><span>areena / 2.0</span></div>
	<section class="intro" aria-labelledby="page-title">
		<h1 id="page-title">I've always had questions.<br /><span>I still do.</span></h1>
		<p><span>I became a journalist to ask questions,</span><span>I'm now looking to take the same skills elsewhere, to a bigger playground.</span></p>
	</section>
	<section class="field" aria-label="An animated exploration of journalism, technology and AI">
		<canvas bind:this={canvas} aria-hidden="true"></canvas>
		<div class="field-bottom">
			<div class="stops" aria-label="Explore a direction">
				{#each stops as stop, index}
					<button class:active={current === index} aria-pressed={current === index} onclick={() => chooseStop(index)}>{stop}</button>
				{/each}
			</div>
			<button class="motion" onclick={() => setMotion(!paused)} aria-label={paused ? 'Resume pixel animation' : 'Pause pixel animation'}>{paused ? 'play ↗' : 'pause Ⅱ'}</button>
		</div>
	</section>

	<details class="tldr">
		<summary>TL;DR <span aria-hidden="true">+</span></summary>
		<p>After a decade in journalism, it’s time for me to move on. I’m proud of the work I’ve done, but I worry about where the industry is headed and my own growth has slowed along the way. I want to take everything journalism has taught me into a space where I can learn new skills, explore AI and be challenged all over again.</p>
	</details>

	<article class="notebook" aria-labelledby="notes-title">
		<header class="notes-heading">
			<h2 id="notes-title">{notes[0]}</h2>
			<svg viewBox="0 0 220 25" aria-hidden="true"><path d="M5 13 Q75 3 208 11 M17 21 Q105 10 185 17" /></svg>
		</header>
		<div class="notes-body">
			{#each notes.slice(1, -1) as paragraph, index}
				<div class="note-entry">
					<p>{paragraph}</p>
					{#if index === 2}
						<aside class="margin-note pink"><span>room to grow?</span><svg viewBox="0 0 100 70" aria-hidden="true"><path d="M85 7 Q28 3 16 57 M8 45 L15 59 L29 49" /></svg></aside>
					{:else if index === 7}
						<aside class="margin-note blue"><span>I want more<br />of this.</span><svg viewBox="0 0 110 30" aria-hidden="true"><path d="M4 18 Q42 7 101 16 M10 25 Q55 17 90 24" /></svg></aside>
					{:else if index === 13}
						<aside class="margin-note purple"><span>same skills,<br />new possibilities.</span><svg viewBox="0 0 110 70" aria-hidden="true"><path d="M10 10 Q97 3 83 55 M73 44 L83 58 L95 46" /></svg></aside>
					{/if}
				</div>
			{/each}
			<p class="closing-note">{notes[notes.length - 1]}</p>
		</div>
	</article>
</main>

<style>
	:global(body:has(.wandering-page)){background:#fff}
	.wandering-page{max-width:1440px;margin:0 auto;padding:32px clamp(22px,5vw,76px) 40px;color:#262035;font-family:Arial,Helvetica,sans-serif}
	.page-meta{display:flex;justify-content:space-between;gap:20px;font:12px/1.4 monospace;border-top:1px solid #e2daef;padding-top:16px}
	.page-meta>span:first-child{font-size:15px;font-weight:bold;letter-spacing:-.05em;color:#783beb}
	.intro{display:grid;gap:28px;padding:54px 0 44px}
	h1{font-size:clamp(44px,6.7vw,92px);font-weight:500;line-height:.98;letter-spacing:-.065em;margin:0}h1 span{color:#783beb}
	.intro>p{font:17px/1.5 Georgia,serif;max-width:none;margin:0 0 5px}.intro>p span{display:block}
	.field{background:#fff;overflow:hidden}
	canvas{display:block;width:100%;height:clamp(290px,34vw,460px);touch-action:pan-y}
	.field-bottom{display:flex;justify-content:space-between;align-items:center;padding:13px 18px;gap:20px;background:#fff}
	.stops{display:flex;flex-wrap:wrap;gap:6px 22px}.stops button,.motion{background:none;border:0;border-radius:0;padding:9px 0;font:12px/1 monospace;color:#7b6d8b;cursor:pointer}.stops button.active{color:#ed2590}.stops button.active::before{content:'■ ';color:#ed2590}.stops button:nth-child(2){color:#783beb}.stops button:nth-child(3){color:#2878ef}.stops button:nth-child(4){color:#ed2590}.stops button:hover,.motion:hover{text-decoration:underline;text-underline-offset:5px}.motion{white-space:nowrap;color:#262035}
	button:focus-visible{outline:2px solid #2878ef;outline-offset:5px}
	@media(max-width:700px){.wandering-page{padding-top:20px}.page-meta{font-size:10px}.page-meta>span:first-child{font-size:13px}.intro{display:block;padding:42px 0 30px}.intro>p{margin-top:24px;font-size:16px}h1{font-size:clamp(42px,10vw,68px)}canvas{height:300px}.field-bottom{padding:9px 12px;gap:12px}.stops{gap:3px 13px}.stops button,.motion{font-size:10px;min-height:38px}.stops{max-width:225px}}

	.notebook{max-width:1100px;margin:100px auto 24px;padding:0 150px 40px 72px;position:relative;font-family:'Special Elite','Courier New',monospace}
	.notebook::before{content:'';position:absolute;left:39px;top:110px;bottom:0;width:1px;background:#f5b5d9;transform:rotate(-.2deg)}
	.notes-heading{position:relative;display:table;margin-bottom:50px;transform:rotate(-3deg)}
	.notes-heading h2{scroll-margin-top:calc(var(--header-h,64px) + 24px);font:400 clamp(36px,4.5vw,58px)/1.15 'Special Elite','Courier New',monospace;color:#783beb;margin:0;letter-spacing:-.035em}
	.notes-heading svg{display:block;width:210px;height:25px;margin-top:4px;overflow:visible;stroke:#ed2590;stroke-width:2.4;stroke-linecap:round;fill:none}
	.notes-body{font-size:clamp(16px,1.45vw,19px);line-height:1.8;color:#393247;letter-spacing:.005em}
	.note-entry{position:relative;margin:0 0 35px}
	.note-entry p{margin:0;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.8em - 1px),#e9e8f570 calc(1.8em - 1px),#e9e8f570 1.8em);background-position:0 .16em}
	.note-entry:nth-child(3n+1){transform:rotate(-.35deg)}
	.note-entry:nth-child(3n+2){transform:rotate(.3deg)}
	.margin-note{position:absolute;left:calc(100% + 38px);top:20px;width:155px;transform:rotate(7deg);font-size:17px;font-weight:400;line-height:1.35}
	.margin-note.pink{color:#dc2589}.margin-note.blue{color:#2878ef;transform:rotate(-8deg)}.margin-note.purple{color:#783beb;transform:rotate(5deg)}
	.margin-note svg{display:block;width:95px;height:65px;margin:10px 0 0 -20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
	.margin-note.blue svg{height:28px;width:110px;margin:2px 0 0 -5px}
	.closing-note{margin:55px 0 0;font-size:clamp(21px,2.2vw,29px);line-height:1.5;color:#2878ef;transform:rotate(-1deg);max-width:32ch}
	@media(max-width:900px){.notebook{padding-right:115px;padding-left:42px}.notebook::before{left:20px}.margin-note{left:calc(100% + 18px);width:110px;font-size:15px}}
	@media(max-width:600px){.notebook{margin-top:65px;padding:0 8px 25px 24px}.notebook::before{left:5px;top:100px}.notes-heading{margin-bottom:34px}.notes-heading svg{width:160px}.notes-body{font-size:16px;line-height:1.8}.note-entry{margin-bottom:28px}.note-entry p{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(1.8em - 1px),#e9e8f570 calc(1.8em - 1px),#e9e8f570 1.8em)}.margin-note{position:relative;left:auto;top:auto;margin:24px 0 32px auto;width:140px;font-size:17px}.margin-note svg{height:40px}.closing-note{font-size:22px;margin-top:38px}}

	.tldr{max-width:1100px;margin:50px auto 0;padding:0 72px;font-family:'Special Elite','Courier New',monospace}
	.tldr summary{display:flex;align-items:center;justify-content:space-between;gap:20px;list-style:none;cursor:pointer;color:#783beb;font-size:17px;padding:14px 0;border-bottom:1px solid #e9e1f3}
	.tldr summary::-webkit-details-marker{display:none}.tldr summary span{font:24px/1 monospace;color:#ed2590}.tldr[open] summary span{transform:rotate(45deg)}
	.tldr summary:focus-visible{outline:2px solid #2878ef;outline-offset:5px}
	.tldr p{max-width:74ch;font-size:17px;line-height:1.8;color:#393247;margin:22px 0 0}
	@media(max-width:900px){.tldr{padding:0 42px}}
	@media(max-width:600px){.tldr{padding:0 8px 0 24px;margin-top:35px}.tldr p{font-size:16px}.tldr summary{font-size:16px}}
</style>
