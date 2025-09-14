<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const links = [
		{ href: '/', label: 'home' },
		{ href: '/work', label: 'work' },
		{ href: '/fun', label: 'fun projects' },
		{ href: '/about', label: 'about' }
	];

	let el: HTMLElement;

	// Measure header height and expose it as a CSS var so we can offset the page on mobile
	onMount(() => {
		const update = () => {
			const h = el?.offsetHeight ?? 0;
			document.documentElement.style.setProperty('--header-h', `${h}px`);
		};
		update();

		const ro = new ResizeObserver(update);
		if (el) ro.observe(el);
		window.addEventListener('resize', update, { passive: true });

		return () => {
			ro.disconnect();
			window.removeEventListener('resize', update);
		};
	});
</script>

<header class="site-header" bind:this={el}>
	<nav aria-label="Primary">
		<ul class="nav">
			{#each links as l, i}
				<li>
					<a href={l.href} aria-current={$page.url.pathname === l.href ? 'page' : undefined}
						>{l.label}</a
					>
					{#if i < links.length - 1}<span class="sep">|</span>{/if}
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.site-header {
		padding: 16px 0;
	}

	.nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		list-style: none;
		margin: 0;
		padding: 0 16px;
	}

	.nav li {
		display: flex;
		align-items: center;
	}

	.nav a {
		text-decoration: none;
		color: #303030;
		font-size: 18px;
		font-weight: 500;
		line-height: 1;
	}

	.nav a:hover {
		text-decoration: underline;
	}

	.nav a[aria-current='page'] {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.sep {
		margin: 0 8px;
		color: #000000;
		user-select: none;
	}

	/* Mobile: keep header ALWAYS visible */
	@media (max-width: 640px) {
		.site-header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 1000;
			background: #fff; /* so content doesn't show through */
			padding: 20px 0; /* your mobile spacing */
			box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
		}

		.nav {
			flex-wrap: wrap;
			gap: 12px 16px;
		}

		.nav a {
			font-size: 18px;
			line-height: 1.3;
		}

		.sep {
			display: none; /* hide pipes on narrow widths */
		}

		/* Offset the page content so the fixed header doesn't cover it */
		:global(body) {
			padding-top: var(--header-h, 64px);
		}
	}
</style>
